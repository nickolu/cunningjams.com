#!/usr/bin/env python3
import re
import os
import sys
from datetime import datetime
from pathlib import Path
import html

def slugify(text):
    """Convert text to a URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def html_to_markdown(html_content):
    """Basic HTML to Markdown conversion"""
    # Unescape HTML entities
    content = html.unescape(html_content)
    
    # Replace \r\n and \n with actual newlines first
    content = content.replace('\\r\\n', '\n').replace('\\n', '\n').replace('\r\n', '\n')
    
    # Convert common HTML tags to Markdown
    # Headers
    content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1', content, flags=re.DOTALL|re.IGNORECASE)
    
    # Bold and italic
    content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', content, flags=re.DOTALL|re.IGNORECASE)
    
    # Links
    content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', content, flags=re.DOTALL|re.IGNORECASE)
    
    # Images
    content = re.sub(r'<img[^>]*src=["\']([^"\']*)["\'][^>]*alt=["\']([^"\']*)["\'][^>]*/?>', r'![\2](\1)', content, flags=re.IGNORECASE)
    content = re.sub(r'<img[^>]*src=["\']([^"\']*)["\'][^>]*/?>', r'![](\1)', content, flags=re.IGNORECASE)
    
    # Lists - handle nested content better
    content = re.sub(r'<ul[^>]*>(.*?)</ul>', lambda m: '\n' + re.sub(r'<li[^>]*>(.*?)</li>', r'- \1', m.group(1), flags=re.DOTALL|re.IGNORECASE).strip() + '\n', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<ol[^>]*>(.*?)</ol>', lambda m: '\n' + re.sub(r'<li[^>]*>(.*?)</li>', r'1. \1', m.group(1), flags=re.DOTALL|re.IGNORECASE).strip() + '\n', content, flags=re.DOTALL|re.IGNORECASE)
    
    # Code
    content = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', content, flags=re.DOTALL|re.IGNORECASE)
    content = re.sub(r'<pre[^>]*>(.*?)</pre>', r'```\n\1\n```', content, flags=re.DOTALL|re.IGNORECASE)
    
    # Paragraphs - convert to double newlines
    content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', content, flags=re.DOTALL|re.IGNORECASE)
    
    # Divs - just remove the tags but keep content
    content = re.sub(r'<div[^>]*>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'</div>', '', content, flags=re.IGNORECASE)
    
    # Line breaks
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    
    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)
    
    # Clean up whitespace in list items
    content = re.sub(r'- \s+', '- ', content)
    content = re.sub(r'1\. \s+', '1. ', content)
    
    # Clean up multiple newlines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Clean up leading/trailing whitespace on each line
    lines = content.split('\n')
    lines = [line.rstrip() for line in lines]
    content = '\n'.join(lines)
    
    return content.strip()

def extract_posts_from_sql(sql_file):
    """Extract blog posts from WordPress SQL dump"""
    with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    posts = []
    
    # Find the INSERT statements with column names
    # Pattern: INSERT INTO `wp_posts` (`col1`, `col2`, ...) VALUES
    header_pattern = r"INSERT INTO `wp_posts` \(([^)]+)\) VALUES"
    header_match = re.search(header_pattern, content)
    
    if not header_match:
        print(f"  Could not find wp_posts INSERT with column names")
        return posts
    
    # Extract column names
    columns_str = header_match.group(1)
    columns = [col.strip().strip('`') for col in columns_str.split(',')]
    
    # Find the column indices we need
    try:
        id_idx = columns.index('ID')
        date_idx = columns.index('post_date')
        content_idx = columns.index('post_content')
        title_idx = columns.index('post_title')
        excerpt_idx = columns.index('post_excerpt')
        status_idx = columns.index('post_status')
        name_idx = columns.index('post_name')
        type_idx = columns.index('post_type')
    except ValueError as e:
        print(f"  Missing required column: {e}")
        return posts
    
    # Find all INSERT statements for wp_posts
    insert_pattern = r"INSERT INTO `wp_posts`[^V]*VALUES\s*\n(.*?)(?=\n--|\nINSERT|\Z)"
    matches = re.finditer(insert_pattern, content, re.DOTALL)
    
    for match in matches:
        values_block = match.group(1)
        
        # Split into individual row entries - they start with '(' and end with '),' or ');'
        row_pattern = r'\(([^(]*?)\)(?:,|;)'
        rows = re.finditer(row_pattern, values_block, re.DOTALL)
        
        for row in rows:
            row_data = row.group(1)
            
            # Parse the row - split by comma but respect quoted strings and parentheses
            values = []
            current_value = ''
            in_quotes = False
            escape_next = False
            paren_depth = 0
            
            for char in row_data:
                if escape_next:
                    current_value += char
                    escape_next = False
                    continue
                    
                if char == '\\':
                    current_value += char
                    escape_next = True
                    continue
                    
                if char == "'" and paren_depth == 0:
                    in_quotes = not in_quotes
                    current_value += char
                elif char == '(' and not in_quotes:
                    paren_depth += 1
                    current_value += char
                elif char == ')' and not in_quotes:
                    paren_depth -= 1
                    current_value += char
                elif char == ',' and not in_quotes and paren_depth == 0:
                    values.append(current_value.strip())
                    current_value = ''
                else:
                    current_value += char
            
            if current_value.strip():
                values.append(current_value.strip())
            
            if len(values) != len(columns):
                continue
            
            # Extract the values we need
            def clean_value(val):
                val = val.strip()
                if val.startswith("'") and val.endswith("'"):
                    val = val[1:-1]
                # Unescape SQL escapes
                val = val.replace("\\\\", "\\").replace("\\'", "'")
                return val
            
            post_status = clean_value(values[status_idx])
            post_type = clean_value(values[type_idx])
            
            # Only extract published posts (not pages, revisions, etc.)
            if post_type == 'post' and post_status == 'publish':
                posts.append({
                    'id': clean_value(values[id_idx]),
                    'title': clean_value(values[title_idx]),
                    'date': clean_value(values[date_idx]),
                    'content': clean_value(values[content_idx]),
                    'excerpt': clean_value(values[excerpt_idx]),
                    'slug': clean_value(values[name_idx]) or slugify(clean_value(values[title_idx]))
                })
    
    return posts

def create_mdx_file(post, output_dir):
    """Create an MDX file from a post"""
    # Parse date
    try:
        date_obj = datetime.strptime(post['date'], '%Y-%m-%d %H:%M:%S')
        formatted_date = date_obj.strftime('%Y-%m-%d')
    except:
        formatted_date = post['date'].split()[0] if post['date'] else '2024-01-01'
    
    # Convert HTML content to Markdown
    markdown_content = html_to_markdown(post['content'])
    
    # Create excerpt if not present
    excerpt = post['excerpt'] if post['excerpt'] else markdown_content[:150] + '...'
    excerpt = html_to_markdown(excerpt).replace('\n', ' ').strip()
    
    # Properly escape YAML strings - use single quotes to avoid most escaping issues
    # If there are single quotes in the string, we need to double them
    title_yaml = post['title'].replace("'", "''")
    excerpt_yaml = excerpt.replace("'", "''")
    
    # Create frontmatter with properly escaped values
    frontmatter = f"""---
title: '{title_yaml}'
date: '{formatted_date}'
description: '{excerpt_yaml}'
author: Nickolus Cunningham
tags:
  - blog
---

"""
    
    # Combine frontmatter and content
    mdx_content = frontmatter + markdown_content
    
    # Create filename
    filename = f"{post['slug']}.mdx"
    filepath = os.path.join(output_dir, filename)
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(mdx_content)
    
    print(f"Created: {filename}")
    return filepath

def main():
    # Directories
    sql_dir = os.path.expanduser('~/Desktop/hostmonster_sql_backups/blog')
    output_dir = os.path.expanduser('~/git/personal/cunningjams.com/content/blog')
    
    # Get all SQL files
    sql_files = list(Path(sql_dir).glob('*.sql'))
    
    if not sql_files:
        print(f"No SQL files found in {sql_dir}")
        return
    
    print(f"Found {len(sql_files)} SQL file(s)")
    
    all_posts = []
    for sql_file in sql_files:
        print(f"\nProcessing: {sql_file.name}")
        posts = extract_posts_from_sql(sql_file)
        print(f"  Found {len(posts)} published posts")
        all_posts.extend(posts)
    
    # Remove duplicates based on title
    unique_posts = {}
    for post in all_posts:
        if post['title'] not in unique_posts:
            unique_posts[post['title']] = post
    
    print(f"\nTotal unique posts: {len(unique_posts)}")
    
    # Create MDX files
    print(f"\nCreating MDX files in {output_dir}...")
    for post in unique_posts.values():
        try:
            create_mdx_file(post, output_dir)
        except Exception as e:
            print(f"Error creating file for '{post['title']}': {e}")
    
    print(f"\nConversion complete!")

if __name__ == '__main__':
    main()

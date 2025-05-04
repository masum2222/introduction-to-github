import os
import logging
import markdown
import json
import glob
import re
from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# Function to read and parse markdown files
def read_markdown_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Split the content into frontmatter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None
    
    # Parse frontmatter as YAML (simple version)
    frontmatter = {}
    for line in parts[1].strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            # Convert numeric values to proper types
            if key == 'rating' or key == 'price':
                try:
                    value = float(value)
                except (ValueError, TypeError):
                    pass
            frontmatter[key] = value
    
    # Convert the body from markdown to HTML
    body_html = markdown.markdown(parts[2], extensions=['extra', 'codehilite'])
    
    # Combine frontmatter and body
    result = frontmatter.copy()
    result['content'] = body_html
    
    # Process body_bn if available
    if 'body_bn' in result:
        result['content_bn'] = markdown.markdown(result['body_bn'], extensions=['extra', 'codehilite'])
    
    result['file_path'] = os.path.basename(file_path)
    
    return result

# Function to get all phone reviews
def get_all_phones():
    phone_files = glob.glob('posts/*.md')
    phones = []
    
    for file_path in phone_files:
        phone_data = read_markdown_file(file_path)
        if phone_data:
            phones.append(phone_data)
    
    # Sort by publish date (newest first)
    return sorted(phones, key=lambda x: datetime.strptime(x.get('date', '2000-01-01'), '%Y-%m-%d'), reverse=True)

# Function to search phones
def search_phones(query):
    all_phones = get_all_phones()
    if not query:
        return all_phones
    
    # Simple search implementation
    query = query.lower()
    results = []
    
    for phone in all_phones:
        if (query in phone.get('title', '').lower() or 
            query in phone.get('title_bn', '').lower() or
            query in phone.get('brand', '').lower()):
            results.append(phone)
    
    return results

@app.route('/')
def index():
    phones = get_all_phones()
    return render_template('index.html', phones=phones)

@app.route('/phone/<filename>')
def phone_detail(filename):
    file_path = f'posts/{filename}'
    phone_data = read_markdown_file(file_path)
    
    if phone_data:
        return render_template('phone.html', phone=phone_data)
    return redirect(url_for('index'))

@app.route('/search')
def search():
    query = request.args.get('q', '')
    results = search_phones(query)
    return jsonify({
        'results': results,
        'count': len(results)
    })

@app.route('/admin')
def admin():
    return render_template('admin/index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

import os
import glob

def bump_version():
    directory = "/Users/mubashirt/websites/onshore-website"
    # Find all html files recursively
    html_files = glob.glob(os.path.join(directory, '**', '*.html'), recursive=True)
    
    count = 0
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Bump auth.js and cart.js to v=3.1
            new_content = content
            new_content = new_content.replace('auth.js?v=3.0', 'auth.js?v=3.1')
            new_content = new_content.replace('cart.js?v=3.0', 'cart.js?v=3.1')
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            
    print(f"Successfully bumped version to v=2.5 in {count} HTML files.")

if __name__ == "__main__":
    bump_version()

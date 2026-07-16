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
                
            if 'auth.js?v=2.4' in content:
                new_content = content.replace('auth.js?v=2.4', 'auth.js?v=2.5')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            
    print(f"Successfully bumped version to v=2.5 in {count} HTML files.")

if __name__ == "__main__":
    bump_version()

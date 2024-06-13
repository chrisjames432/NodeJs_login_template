import os

def create_directory_structure(directory, files):
    result = []
    relative_files = [os.path.relpath(file, directory) for file in files]
    relative_files.sort()
    
    for file in relative_files:
        parts = file.split(os.sep)
        indent = 0
        path_so_far = ""
        for part in parts:
            path_so_far = os.path.join(path_so_far, part)
            if os.path.isdir(path_so_far):
                if '├── ' + part not in result:
                    result.append('    ' * indent + '├── ' + part)
            else:
                if '    ' * indent + '├── ' + part not in result:
                    result.append('    ' * indent + '├── ' + part)
            indent += 1
    
    return result, files

def write_directory_structure(filename, directory_structure):
  
    heading = "#Directory Structure of the Project\n"
    heading += "##This file contains a structured listing of all directories and files within the project. Contents are included for specified files.\n\n"

    with open(filename, 'w', encoding='utf-8') as file:
        
        file.write(heading)
        file.write('\n'.join(directory_structure) + "\n\n")

def append_file_contents(filename, files_list):
    with open(filename, 'a', encoding='utf-8') as file:
        for file_path in files_list:
            relative_path = os.path.relpath(file_path, os.path.dirname(os.path.abspath(__file__)))
            file.write(f"\n#Contents of {relative_path}:\n\n")
            file.write("")
            try:
                with open(file_path, 'r', encoding='utf-8') as content_file:
                    file.write(content_file.read())
            except Exception as e:
                file.write(f"Error reading file: {str(e)}")
            file.write("\n\n\n")

def main():
    files_list = [
        # List the files you want to process here
        'app.js',
        'checkip.js',
        'email.js',
        'mongologin.js',
        os.path.join('client', 'js/main.js'),
        os.path.join('client', 'index.html'),
        os.path.join('client', 'css/main.css'),
        os.path.join('client','reset-password.html')
                
    ]
    filename = 'program_structure.md'
    directory = os.path.dirname(os.path.abspath(__file__))
    
    directory_structure, files_left = create_directory_structure(directory, files_list)
    write_directory_structure(filename, directory_structure)
    append_file_contents(filename, files_left)

if __name__ == "__main__":
    main()
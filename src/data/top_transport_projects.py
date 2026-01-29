import json
import re
import os
from collections import defaultdict

def parse_budget(budget_str):
    if not budget_str:
        return 0.0
    
    budget_str = budget_str.split('(')[0].strip()
    match = re.search(r'([\d,]+\.?\d*)', budget_str)
    if match:
        value_str = match.group(1).replace(',', '')
        try:
            return float(value_str)
        except ValueError:
            return 0.0
    return 0.0

def find_top_transport_projects(file_paths):
    transport_projects = []

    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if not content:
                    continue
                
                data = json.loads(content)
                projects = data.get("projects", [])
                
                for project in projects:
                    if project.get("category", "").strip().lower() == 'transport':
                        budget_val = parse_budget(project.get("budget"))
                        if budget_val > 0:
                            transport_projects.append({
                                "title": project.get("title"),
                                "district": project.get("districtId"),
                                "budget": budget_val
                            })

        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Error processing file {file_path}: {e}")

    sorted_projects = sorted(transport_projects, key=lambda p: p['budget'], reverse=True)
    
    return sorted_projects[:10]

if __name__ == "__main__":
    base_path = "/home/rohithvijayan/Desktop/KeralaNXT/src/data/projects/"
    files = [
        "alappuzha.json", "ernakulam.json", "idukki.json", "kannur.json",
        "kasaragod.json", "kollam.json", "kottayam.json", "kozhikode.json",
        "malappuram.json", "palakkad.json", "pathanamthitta.json",
        "statewide.json", "thiruvananthapuram.json", "thrissur.json", "wayanad.json"
    ]
    
    file_paths = [os.path.join(base_path, f) for f in files]
    
    top_10_projects = find_top_transport_projects(file_paths)
    
    print("Top 10 Most Expensive Transport Projects:\n")
    print(f"{'Rank':<5} | {'Title':<70} | {'District':<20} | {'Budget (Cr)':<15}")
    print("-" * 120)

    for i, project in enumerate(top_10_projects, 1):
        print(f"{i:<5} | {project['title']:<70} | {project['district'].capitalize():<20} | {project['budget']:<15,.2f}")

import os, json, subprocess, markdown, shutil

# CONFIG
SRC = "./content"
DEST = "./public/content"
JSON_OUT = "./public/timeline.json"
MAX_MB = 25

os.makedirs(DEST, exist_ok=True)

def needs_sync(src, dst):
    if not os.path.exists(dst): return True
    return os.path.getmtime(src) > os.path.getmtime(dst)

def process_media(path, folder, name):
    ext = os.path.splitext(name)[1].lower()
    is_video = ext in ['.mp4', '.mov', '.mkv']
    out_ext = ".mp4" if is_video else ".mp3"
    out_name = name.replace(ext, f"_web{out_ext}")
    out_path = os.path.join(DEST, folder, out_name)
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    if not needs_sync(path, out_path): return f"content/{folder}/{out_name}"

    print(f"-> Optimizing: {name}")
    codec = 'libx264 -crf 28' if is_video else 'libmp3lame -b:a 128k'
    cmd = f'ffmpeg -i "{path}" -vcodec {codec} -preset faster -y "{out_path}"' if is_video else f'ffmpeg -i "{path}" -acodec {codec} -y "{out_path}"'
    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    return f"content/{folder}/{out_name}"

def build():
    data = []
    if not os.path.exists(SRC): return print("No /content found.")
    
    folders = sorted([f for f in os.listdir(SRC) if "_" in f], reverse=True)
    for fld in folders:
        date, title = fld.split("_", 1)
        path = os.path.join(SRC, fld)
        cat = "finance" if "tax" in title.lower() or "audit" in title.lower() else "default"
        
        entry = {"date": date, "title": title.replace("-", " "), "category": cat, "type": "article"}
        
        for f in os.listdir(path):
            f_path = os.path.join(path, f)
            ext = os.path.splitext(f)[1].lower()
            if f == "index.md":
                with open(f_path, 'r') as md_f:
                    raw = md_f.read()
                    entry["description"] = markdown.markdown(raw)
                    entry["raw_md"] = raw
            elif ext in ['.mp4', '.mov', '.m4a', '.mp3']:
                entry["asset_path"] = process_media(f_path, fld, f)
                entry["type"] = "video" if ext in ['.mp4', '.mov'] else "audio"
            elif ext in ['.png', '.jpg', '.pdf']:
                d_path = os.path.join(DEST, fld, f)
                if needs_sync(f_path, d_path):
                    os.makedirs(os.path.dirname(d_path), exist_ok=True)
                    shutil.copy2(f_path, d_path)
                entry["asset_path"], entry["type"] = f"content/{fld}/{f}", "infographic" if ext != '.pdf' else "document"
        data.append(entry)

    with open(JSON_OUT, 'w') as out: json.dump(data, out, indent=2)
    print(f"Done. {len(data)} items in the vault.")

if __name__ == "__main__": build()
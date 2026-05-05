import re

file_path = 'c:\\Users\\MY LAPTOP\\AgriGovMarketVerF-\\backend\\apps\\chat\\views.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_returns(match):
    body = match.group(0)
    lines = body.split('\n')
    new_lines = []
    for line in lines:
        if 'return ' in line:
            stripped = line.strip()
            if stripped.startswith('return ') and not stripped.endswith('True') and not stripped.endswith('False') and not stripped.endswith('is_direct') and not stripped.endswith('True,'):
                # Only add ", False" if it's not returning a tuple already
                if not re.search(r',\s*(True|False|is_direct)\s*$', stripped):
                    line = line + ', False'
        new_lines.append(line)
    return '\n'.join(new_lines)

# Apply to the 4 handlers
content = re.sub(r'def _handle_farmer_request.*?(?=def _handle_transporter_request)', replace_returns, content, flags=re.DOTALL)
content = re.sub(r'def _handle_transporter_request.*?(?=def _handle_buyer_request)', replace_returns, content, flags=re.DOTALL)
content = re.sub(r'def _handle_buyer_request.*?(?=def _handle_admin_request)', replace_returns, content, flags=re.DOTALL)
content = re.sub(r'def _handle_admin_request.*?(?=def _get_platform_summary)', replace_returns, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced returns.")

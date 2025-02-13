import glob
import subprocess
import pandas as pd

from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Tuple, TypedDict


class StatDict(TypedDict):
    file: str
    total_rows: int
    translated: int
    translation_rate: float


FILE_BAR_WIDTH: int = 20
GLOBAL_BAR_WIDTH: int = 30
BROKEN_FILES: List[str] = ['ongoing/40.csv',
                           'ongoing/41.csv', 'ongoing/44.csv', 'ongoing/46.csv']


def generate_progress_bar(percentage: float, width: int) -> str:
    filled: int = int(width * percentage / 100)
    return f"[{'■' * filled}{'□' * (width - filled)}] {percentage:.1f}%"


def calculate_stats() -> Tuple[List[StatDict], int, int]:
    stats: List[StatDict] = []
    total_rows: int = 0
    total_translated: int = 0

    csv_files: List[str] = sorted(glob.glob("ongoing/*.csv"),
                                  key=lambda x: int(Path(x).stem))

    for file in csv_files:
        if file in BROKEN_FILES:
            continue

        df = pd.read_csv(file)
        rows: int = len(df)
        translated: int = df['eng'].notna().sum()
        translation_rate: float = (translated / rows * 100) if rows > 0 else 0

        stats.append({
            'file': Path(file).name,
            'total_rows': rows,
            'translated': translated,
            'translation_rate': translation_rate
        })

        total_rows += rows
        total_translated += translated

    return stats, total_rows, total_translated


def get_contributors() -> Dict[str, int]:
    cmd = 'git log --pretty=format:"%an" ongoing/*.csv'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    contributors: Dict[str, int] = defaultdict(int)
    for name in result.stdout.split('\n'):
        if name := name.strip():
            contributors[name] += 1

    return dict(sorted(contributors.items(), key=lambda x: x[1], reverse=True))


def generate_markdown(stats: List[StatDict], total_rows: int, total_translated: int) -> str:
    global_progress: float = (total_translated / total_rows *
                              100) if total_rows > 0 else 0

    markdown: List[str] = [
        "# Translation dashboard",
        "",
        "## Global progress",
        "",
        generate_progress_bar(global_progress, GLOBAL_BAR_WIDTH),
        "",
        f"- Total sentences: {total_rows:,}",
        f"- Translated sentences: {total_translated:,}",
        "",
        "## Progress by file",
        "",
        "| File | Progress bar | Translated | Progress |",
        "|------|-------------|------------|----------|"
    ]

    # Sort by progress percentage
    for stat in sorted(stats, key=lambda x: x['translation_rate'], reverse=True):
        progress_bar: str = generate_progress_bar(
            stat['translation_rate'], FILE_BAR_WIDTH)
        row: str = f"| {stat['file']} | {progress_bar} | {stat['translated']:,}/{stat['total_rows']:,} | {stat['translation_rate']:.1f}% |"
        markdown.append(row)

    # Contributors section
    markdown.extend([
        "",
        "## Recent contributors",
        "",
        "| Contributor | Contributions |",
        "|------------|---------------|"
    ])

    for name, count in get_contributors().items():
        markdown.append(f"| {name} | {count} |")

    markdown.extend([
        "",
        f"Last updated: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        ""
    ])

    return "\n".join(markdown)


def main() -> None:
    try:
        stats, total_rows, total_translated = calculate_stats()
        dashboard: str = generate_markdown(stats, total_rows, total_translated)

        with open("dashboard.md", "w", encoding="utf-8") as f:
            f.write(dashboard)

    except Exception as e:
        print(f"Error updating dashboard: {e}")
        exit(1)


if __name__ == "__main__":
    main()

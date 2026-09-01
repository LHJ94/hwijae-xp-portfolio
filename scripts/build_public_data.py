#!/usr/bin/env python3
"""Create deploy-safe portfolio JSON from the private working datasets."""

from __future__ import annotations

import json
import re
from pathlib import Path


CASE_PROJECT_IDS = [
    "flagshop-rebranding",
    "website-renewal",
    "technical-seo-and-search-visibility",
    "search-advertising",
    "always-on-pr-program",
    "people-and-culture-expo-2026",
]

PUBLIC_PROJECT_FIELDS = [
    "id",
    "title",
    "period",
    "category_ids",
    "portfolio_tier",
    "objective",
    "documented_contributions",
    "documented_outputs",
    "case_study_angle",
    "result_evidence",
    "needed_to_publish",
]

PERSON_BEFORE_REPORTER = re.compile(r"([가-힣]{2,4}) 기자")


def read_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as source:
        return json.load(source)


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as destination:
        json.dump(payload, destination, ensure_ascii=False, indent=2)
        destination.write("\n")


def public_portfolio(source: dict) -> dict:
    projects_by_id = {project["id"]: project for project in source["portfolio_projects"]}
    projects = []

    for project_id in CASE_PROJECT_IDS:
        project = projects_by_id[project_id]
        projects.append({key: project.get(key) for key in PUBLIC_PROJECT_FIELDS})

    return {
        "dataset_version": source.get("dataset_version"),
        "purpose": "public_marketing_portfolio",
        "language": source.get("language", "ko"),
        "organization": source.get("organization"),
        "taxonomy": source.get("taxonomy", []),
        "portfolio_projects": projects,
    }


def redact_title(title: str) -> str:
    return PERSON_BEFORE_REPORTER.sub("기자", title)


def canonical_statuses(statuses: list[str]) -> list[str]:
    normalized = []
    if "완료" in statuses:
        normalized.append("완료")
    if any("진행" in status for status in statuses):
        normalized.append("진행")
    return normalized or ["기록"]


def public_legacy(source: dict) -> dict:
    years = {}
    for year, year_data in source["yearly_work_index"].items():
        records = []
        for record in year_data.get("records", []):
            records.append(
                {
                    "title": redact_title(record.get("title", "")),
                    "categories": [
                        category
                        for category in record.get("categories", [])
                        if not str(category).isdigit()
                    ],
                    "statuses": canonical_statuses(record.get("statuses", [])),
                }
            )

        years[year] = {
            "unique_titles": year_data.get("unique_titles"),
            "indexed_titles": year_data.get("indexed_titles"),
            "records": records,
        }

    return {
        "dataset_version": source.get("dataset_version"),
        "purpose": "public_legacy_work_index",
        "privacy_policy": "개인 이름과 내부 시트 위치를 공개 데이터에서 제외",
        "yearly_work_index": years,
    }


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    portfolio_source = project_root / "data" / "portfolio-dataset.json"
    legacy_source = project_root / "data" / "legacy-2024-2025.json"
    portfolio_output = project_root / "data" / "portfolio-public.json"
    legacy_output = project_root / "data" / "legacy-public-2024-2025.json"

    write_json(portfolio_output, public_portfolio(read_json(portfolio_source)))
    write_json(legacy_output, public_legacy(read_json(legacy_source)))
    print(f"created: {portfolio_output}")
    print(f"created: {legacy_output}")


if __name__ == "__main__":
    main()

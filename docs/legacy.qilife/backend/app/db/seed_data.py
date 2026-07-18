from __future__ import annotations

from datetime import date, datetime

from app.db.models import (
    Action,
    ActionStep,
    Bucket,
    DailySummary,
    KnowledgeItem,
    Link,
    Obligation,
    Person,
    Qibit,
    Thread,
    Transaction,
)

BUCKETS = [
    Bucket(code="00", name="Inbox", slug="inbox", folder_path="/00_inbox", sort_order=1, description="Raw capture, unprocessed QiBits"),
    Bucket(code="10", name="Workbench", slug="workbench", folder_path="/10_workbench", sort_order=2, description="Active staging area"),
    Bucket(code="20", name="Timeline", slug="timeline", folder_path="/20_timeline", sort_order=3, description="Chronological life ledger"),
    Bucket(code="30", name="Life", slug="life", folder_path="/30_life", sort_order=4, description="Personal life and household"),
    Bucket(code="40", name="People", slug="people", folder_path="/40_people", sort_order=5, description="People and relationship logs"),
    Bucket(code="50", name="Business", slug="business", folder_path="/50_business", sort_order=6, description="Projects and ventures"),
    Bucket(code="60", name="Finance", slug="finance", folder_path="/60_finance", sort_order=7, description="Money and obligations"),
    Bucket(code="70", name="Legal", slug="legal", folder_path="/70_legal", sort_order=8, description="Legal and evidence"),
    Bucket(code="80", name="Tech", slug="tech", folder_path="/80_tech", sort_order=9, description="Apps, repos, and automation"),
    Bucket(code="90", name="Assets", slug="assets", folder_path="/90_assets", sort_order=10, description="Media and reusable assets"),
    Bucket(code="100", name="Data", slug="data", folder_path="/100_data", sort_order=11, description="Schemas and exports"),
    Bucket(code="110", name="Reference", slug="reference", folder_path="/110_reference", sort_order=12, description="Durable knowledge"),
    Bucket(code="900", name="Archive", slug="archive", folder_path="/900_archive", sort_order=13, description="Inactive records"),
    Bucket(code="990", name="System", slug="system", folder_path="/990_system", sort_order=14, description="System configuration", is_system=True),
]


def build_seed_records() -> dict[str, list]:
    people = [
        Person(
            id="01JWNX2D3Q4A5B6C7D8E9F0G1H",
            display_name="Cody",
            legal_name="Cody",
            type="person",
            relationship="self",
            notes="Owner, agent, and primary operator of this Personal LifeDesk.",
        ),
        Person(
            id="01JWNX2D3Q4A5B6C7D8E9F0G1J",
            display_name="Zai",
            legal_name="Zaituallah Jan Khebarkhil",
            type="person",
            relationship="friend/collaborator",
            phone="+1-555-0199",
            notes="Lyft driving companion and roommate.",
        ),
    ]

    threads = [
        Thread(
            id="01JWNX8F6R7S8T9U0V1W2X3Y4A",
            title="Lyft Income Sprint",
            description="Tracking rides, gas expenses, and income targets for driving sessions.",
            bucket_code="50",
            status="active",
            priority="high",
        ),
        Thread(
            id="01JWNX8F6R7S8T9U0V1W2X3Y4B",
            title="Surplus Check Recovery",
            description="Tracking the reissue process for the misplaced tax surplus check.",
            bucket_code="70",
            status="open",
            priority="critical",
        ),
    ]

    qibits = [
        Qibit(
            id="01JWNY1H2J3K4L5M6N7P8Q9R0B",
            title="Gas Loan to Zai",
            raw_capture="Zai owes me $40 for gas.",
            summary="Zai reimbursement obligation.",
            meaning="Outstanding loan of $40 for gas share.",
            qibit_type="obligation_seed",
            bucket_code="60",
            thread_id="01JWNX8F6R7S8T9U0V1W2X3Y4A",
            status="open",
            priority="high",
            importance="high",
            action_required=True,
            suggested_action="Collect $40 from Zai",
            future_slot="waiting_on",
            captured_at=datetime.fromisoformat("2026-05-29T08:30:00"),
            tags_json=["gas", "zai", "reimbursement"],
        ),
        Qibit(
            id="01JWNY1H2J3K4L5M6N7P8Q9R0D",
            title="Check Mail Reminder",
            raw_capture="Check the mailbox for the surplus check letter.",
            summary="Mailbox check reminder.",
            meaning="The surplus check thread needs a physical mailbox review.",
            qibit_type="task_seed",
            bucket_code="70",
            thread_id="01JWNX8F6R7S8T9U0V1W2X3Y4B",
            status="triaged",
            priority="critical",
            importance="high",
            action_required=True,
            future_slot="today",
            captured_at=datetime.fromisoformat("2026-05-29T09:15:00"),
            tags_json=["mail", "surplus-check"],
        ),
    ]

    actions = [
        Action(
            id="01JWNY9K3L4M5N6P7Q8R9S0T1A",
            title="Finish 11 Lyft rides",
            description="Complete driving quota for the weekend sprint.",
            source_qibit_id="01JWNY1H2J3K4L5M6N7P8Q9R0B",
            bucket_code="50",
            thread_id="01JWNX8F6R7S8T9U0V1W2X3Y4A",
            status="in_progress",
            priority="high",
            scheduled_for=datetime.fromisoformat("2026-05-29T09:00:00"),
            context="car",
        ),
        Action(
            id="01JWNY9K3L4M5N6P7Q8R9S0T1B",
            title="Check mail for surplus check",
            description="Inspect the physical mailbox for the State Revenue check letter.",
            source_qibit_id="01JWNY1H2J3K4L5M6N7P8Q9R0D",
            bucket_code="70",
            thread_id="01JWNX8F6R7S8T9U0V1W2X3Y4B",
            status="open",
            priority="critical",
            scheduled_for=datetime.fromisoformat("2026-05-29T16:00:00"),
            context="errands",
        ),
    ]

    steps = [
        ActionStep(action_id="01JWNY9K3L4M5N6P7Q8R9S0T1B", title="Walk to physical mailbox", sort_order=1),
        ActionStep(action_id="01JWNY9K3L4M5N6P7Q8R9S0T1B", title="Review incoming letters for State Revenue logo", sort_order=2),
    ]

    obligations = [
        Obligation(
            id="01JWNZ4M5N6P7Q8R9S0T1U2V3A",
            owed_by_label="Zai",
            owed_to_label="Cody",
            obligation_type="money",
            amount_cents=4000,
            currency="USD",
            reason="Gas payment share for Lyft driving run",
            status="open",
            source_qibit_id="01JWNY1H2J3K4L5M6N7P8Q9R0B",
        )
    ]

    transactions = [
        Transaction(
            id="01JWNZ4M5N6P7Q8R9S0T1U2V3B",
            date=date.fromisoformat("2026-05-29"),
            amount_cents=6523,
            currency="USD",
            direction="out",
            from_label="Cody",
            to_label="Shell Gas Station",
            category="gas",
            bucket_code="60",
            thread_id="01JWNX8F6R7S8T9U0V1W2X3Y4A",
            status="cleared",
            source_qibit_id="01JWNY1H2J3K4L5M6N7P8Q9R0B",
            notes="Initial full-tank purchase. Shared with Zai.",
        )
    ]

    knowledge = [
        KnowledgeItem(
            id="01JWP01N6P7Q8R9S0T1U2V3W4A",
            title="QiBit Lifecycle Doctrine",
            body_markdown="# QiBit Lifecycle\n\nCapture, Bucket, Interpret, Relate, Slot, Breakdown, Enrich, Act, Resolve, Reflect, Retrieve.",
            bucket_code="110",
            knowledge_type="doctrine",
            source_type="repo_doc",
            source_path="docs/10_product/01_qibit_lifecycle.md",
            visibility="system",
        )
    ]

    links = [
        Link(source_type="qibits", source_id="01JWNY1H2J3K4L5M6N7P8Q9R0B", target_type="obligations", target_id="01JWNZ4M5N6P7Q8R9S0T1U2V3A", relationship="created_from"),
        Link(source_type="obligations", source_id="01JWNZ4M5N6P7Q8R9S0T1U2V3A", target_type="people", target_id="01JWNX2D3Q4A5B6C7D8E9F0G1J", relationship="relates_to"),
        Link(source_type="knowledge_items", source_id="01JWP01N6P7Q8R9S0T1U2V3W4A", target_type="threads", target_id="01JWNX8F6R7S8T9U0V1W2X3Y4A", relationship="explains"),
    ]

    summaries = [
        DailySummary(
            date=date.fromisoformat("2026-05-29"),
            summary_markdown="- Captured the Zai gas reimbursement.\n- Scheduled surplus check follow-up.",
            ai_summary_json={"source": "seed"},
            reviewed=False,
        )
    ]

    return {
        "people": people,
        "threads": threads,
        "qibits": qibits,
        "actions": actions,
        "steps": steps,
        "obligations": obligations,
        "transactions": transactions,
        "knowledge": knowledge,
        "links": links,
        "summaries": summaries,
    }

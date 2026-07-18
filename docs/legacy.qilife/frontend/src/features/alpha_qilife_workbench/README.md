# QiLife Workbench Alpha Data Reader & Types

This folder houses the isolated data layer and components for the read-only **QiLife Workbench Prototype Surface**.

## Architecture & Design Decisions
- **Source Grounds**: Reads directly from Supabase tables (`qilife_entities` and `qilife_entity_relationships`).
- **Read-Only**: Purely reads, queries, and groups entities without editing back to the store.
- **Portability**: Uses design system tokens inspired by the oklch-based bands and dashboard cards.

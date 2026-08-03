# ZIPTRA

Ziptra is a low cost AI kanban board

## Selling point:
    - AI subscriptions are expensive

## Goal: Build a harness / tooling that:
    - splits tasks up into tiny chunks
    - never goes above 90k context window
    - uses kanban board for tracking tasks with axi tooling
    - prefers tiny vertical slices and then e2e testing separation

## Specs:
    - The kanban board should have 'projects' and 'tasks'
    - Projects can be in "New", "Active", or "Closed"
    - Tasks can be in "New", "Explore", "Build", "Validate", "Closed"
        - Tasks and Projects have fields:
            - Title
            - Description
            - Comments
    - Repos can be linked to Projects
    - Agent should have easy axi tool to:
        - View board
        - View and Filter by:
            - Project / Task name
            - Project / Task ID
            - Column
        - Move cards
        - Close and create cards
        - Comment on cards


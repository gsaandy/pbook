# Setup & Configuration

## Overview

A clean, efficient management interface where admins handle all master data (shops, routes, employees). This section uses a traditional table-based CRUD pattern optimized for data entry and scanning.

## Key Functionality

- View and manage shops (add, edit, delete, bulk CSV import)
- Create and manage routes (assign shops to routes)
- Manage employees (add, edit, activate/deactivate)
- Search and filter across all entities
- Mobile-responsive tables that convert to cards

## User Flows

### Managing Shops

View all shops in a sortable table, search/filter by name or zone, add shops via form or CSV bulk import, edit/delete individual shops inline.

### Managing Routes

View routes as cards showing name and shop count, create routes by naming them and selecting shops from a checklist, edit/delete routes.

### Managing Employees

View employees in a table, add employees with name/phone/email/role, activate/deactivate employees to preserve history.

## Components Provided

- `SetupAndConfiguration` — Main three-tab interface with shops, routes, and employees management

## Visual Reference

See `screenshot.png` for the target UI design.

const permissions = {
    'super-admin': ['edit-shifts','manage-all-users', 'assign-all-roles', 'assign-all-shifts'],
    'office-leader': ['edit-shifts', 'allow-shift-swap', 'assign-shifts-to-team-leader', 'assign-shifts-to-worker', 'manage-users'],
    'team-leader': ['allow-shift-swap'],
    'worker': ['request-shift-swap']
};

export { permissions }
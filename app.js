// Time Tracking Application JavaScript

class TimeTrackingApp {
    constructor() {
        this.currentWeek = '';
        this.currentEmployee = 'Gary Shaw';
        this.entries = [];
        this.timesheetStatus = 'Draft'; // Draft, Submitted, Locked
        this.currentDay = '';
        
        this.init();
    }

    init() {
        this.setCurrentWeek();
        this.loadSampleData();
        this.bindEvents();
        this.updateUI();
        this.updateReports(); // Initialize reports on load
    }

    setCurrentWeek() {
        // Set to current Monday
        const today = new Date('2025-06-09'); // Using the provided current date
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        this.currentWeek = monday.toISOString().split('T')[0];
        document.getElementById('weekSelect').value = this.currentWeek;
    }

    loadSampleData() {
        // Load the sample entries provided in the application data
        const sampleEntries = [
            {
                id: 1,
                employee: "Gary Shaw",
                week: "2025-06-09",
                day: "Monday",
                activity: "Project Design",
                specificItem: "C-2861",
                hours: 6.5,
                comments: "Completed initial transformer design calculations"
            },
            {
                id: 2,
                employee: "Gary Shaw", 
                week: "2025-06-09",
                day: "Monday",
                activity: "Sales",
                specificItem: "Q#1234",
                hours: 1.5,
                comments: "Reviewed customer specifications for new quote"
            },
            {
                id: 3,
                employee: "Gary Shaw",
                week: "2025-06-09", 
                day: "Tuesday",
                activity: "Project Factory",
                specificItem: "C-2567",
                hours: 4.0,
                comments: "Provided manufacturing support for assembly issues"
            },
            {
                id: 4,
                employee: "Gary Shaw",
                week: "2025-06-09",
                day: "Tuesday", 
                activity: "R&D",
                specificItem: "R&D",
                hours: 4.0,
                comments: "Researched new core materials for efficiency improvements"
            }
        ];

        this.entries = [...sampleEntries];
    }

    bindEvents() {
        // Tab navigation - ensure this works properly
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submission
        const form = document.getElementById('timeEntryForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Activity change handler
        const activitySelect = document.getElementById('activitySelect');
        if (activitySelect) {
            activitySelect.addEventListener('change', (e) => this.handleActivityChange(e));
        }

        // Week selection change
        const weekSelect = document.getElementById('weekSelect');
        if (weekSelect) {
            weekSelect.addEventListener('change', (e) => this.handleWeekChange(e));
        }

        // Employee name change
        const employeeName = document.getElementById('employeeName');
        if (employeeName) {
            employeeName.addEventListener('change', (e) => this.handleEmployeeChange(e));
        }

        // Submit timesheet
        const submitBtn = document.getElementById('submitTimesheet');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTimesheet());
        }

        // Modal buttons
        const addAnotherBtn = document.getElementById('addAnotherBtn');
        const doneBtn = document.getElementById('doneBtn');
        if (addAnotherBtn) addAnotherBtn.addEventListener('click', () => this.addAnother());
        if (doneBtn) doneBtn.addEventListener('click', () => this.closeModal());

        // Reports filters
        const applyFiltersBtn = document.getElementById('applyFilters');
        const clearFiltersBtn = document.getElementById('clearFilters');
        const exportBtn = document.getElementById('exportCSV');
        
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCSV());

        // Day selection change to update daily total
        const daySelect = document.getElementById('daySelect');
        if (daySelect) {
            daySelect.addEventListener('change', () => this.updateSummaryStats());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'confirmModal') {
                    this.closeModal();
                }
            });
        }
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName); // Debug log
        
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const targetTab = document.getElementById(tabName);
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab && targetBtn) {
            targetTab.classList.add('active');
            targetBtn.classList.add('active');
            
            // Update reports when switching to reports tab
            if (tabName === 'reports') {
                this.updateReports();
            }
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.timesheetStatus === 'Locked') {
            alert('This timesheet is locked and cannot be modified.');
            return;
        }

        const formData = this.getFormData();
        
        if (this.validateEntry(formData)) {
            this.addEntry(formData);
            this.updateUI();
            this.showModal(formData.day);
        }
    }

    getFormData() {
        return {
            employee: document.getElementById('employeeName').value,
            week: document.getElementById('weekSelect').value,
            day: document.getElementById('daySelect').value,
            activity: document.getElementById('activitySelect').value,
            specificItem: document.getElementById('specificItem').value,
            hours: parseFloat(document.getElementById('hours').value),
            comments: document.getElementById('comments').value
        };
    }

    validateEntry(entry) {
        const errors = [];

        if (!entry.day) errors.push('Day is required');
        if (!entry.activity) errors.push('Activity is required');
        if (!entry.hours || entry.hours <= 0) errors.push('Hours must be greater than 0');
        if (entry.hours > 24) errors.push('Hours cannot exceed 24');

        // Check daily total
        const dailyTotal = this.calculateDailyTotal(entry.day) + entry.hours;
        if (dailyTotal > 12) {
            const proceed = confirm(`Warning: Total hours for ${entry.day} will be ${dailyTotal.toFixed(1)} hours. This exceeds 12 hours. Continue?`);
            if (!proceed) return false;
        }

        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    addEntry(entry) {
        this.entries.push({
            ...entry,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
    }

    handleActivityChange(e) {
        const activity = e.target.value;
        const specificItemField = document.getElementById('specificItem');
        
        // Auto-fill specific item based on activity
        switch (activity) {
            case 'R&D':
                specificItemField.value = 'R&D';
                specificItemField.readOnly = true;
                break;
            case 'Misc':
                specificItemField.value = 'Misc';
                specificItemField.readOnly = true;
                break;
            case 'Vacation':
                specificItemField.value = 'Vacation';
                specificItemField.readOnly = true;
                break;
            case 'Project Design':
            case 'Project Factory':
                specificItemField.value = '';
                specificItemField.placeholder = 'Enter C-number (e.g., C-2567)';
                specificItemField.readOnly = false;
                break;
            case 'Sales':
                specificItemField.value = '';
                specificItemField.placeholder = 'Enter Quote number (e.g., Q#1234) or "General"';
                specificItemField.readOnly = false;
                break;
            default:
                specificItemField.value = '';
                specificItemField.placeholder = 'Auto-filled based on activity';
                specificItemField.readOnly = false;
        }
    }

    handleWeekChange(e) {
        this.currentWeek = e.target.value;
        this.updateUI();
    }

    handleEmployeeChange(e) {
        this.currentEmployee = e.target.value;
        this.updateUI();
    }

    showModal(day) {
        this.currentDay = day;
        const modalDay = document.getElementById('modalDay');
        const modal = document.getElementById('confirmModal');
        
        if (modalDay) modalDay.textContent = day;
        if (modal) modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.classList.remove('active');
        this.resetForm();
    }

    addAnother() {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.classList.remove('active');
        
        // Pre-select the same day
        const daySelect = document.getElementById('daySelect');
        if (daySelect) daySelect.value = this.currentDay;
        
        // Clear other fields
        const activitySelect = document.getElementById('activitySelect');
        const specificItem = document.getElementById('specificItem');
        const hours = document.getElementById('hours');
        const comments = document.getElementById('comments');
        
        if (activitySelect) activitySelect.value = '';
        if (specificItem) specificItem.value = '';
        if (hours) hours.value = '';
        if (comments) comments.value = '';
    }

    resetForm() {
        const form = document.getElementById('timeEntryForm');
        if (form) form.reset();
        
        const specificItem = document.getElementById('specificItem');
        if (specificItem) {
            specificItem.readOnly = false;
            specificItem.placeholder = 'Auto-filled based on activity';
        }
    }

    calculateDailyTotal(day) {
        return this.getCurrentWeekEntries()
            .filter(entry => entry.day === day)
            .reduce((total, entry) => total + entry.hours, 0);
    }

    calculateWeeklyTotal() {
        return this.getCurrentWeekEntries()
            .reduce((total, entry) => total + entry.hours, 0);
    }

    getCurrentWeekEntries() {
        return this.entries.filter(entry => 
            entry.employee === this.currentEmployee && 
            entry.week === this.currentWeek
        );
    }

    updateUI() {
        this.updateSummaryStats();
        this.updateEntriesTable();
        this.populateFilterEmployees();
    }

    updateSummaryStats() {
        const selectedDay = document.getElementById('daySelect')?.value;
        const dailyTotal = selectedDay ? this.calculateDailyTotal(selectedDay) : 0;
        const weeklyTotal = this.calculateWeeklyTotal();

        const dailyTotalEl = document.getElementById('dailyTotal');
        const weeklyTotalEl = document.getElementById('weeklyTotal');
        
        if (dailyTotalEl) dailyTotalEl.textContent = `${dailyTotal.toFixed(1)} hrs`;
        if (weeklyTotalEl) weeklyTotalEl.textContent = `${weeklyTotal.toFixed(1)} hrs`;
        
        const statusElement = document.getElementById('timesheetStatus');
        if (statusElement) {
            statusElement.textContent = this.timesheetStatus;
            statusElement.className = `status status--${this.getStatusClass()}`;
        }
    }

    getStatusClass() {
        switch (this.timesheetStatus) {
            case 'Draft': return 'info';
            case 'Submitted': return 'warning';
            case 'Locked': return 'success';
            default: return 'info';
        }
    }

    updateEntriesTable() {
        const tbody = document.getElementById('entriesTableBody');
        if (!tbody) return;
        
        const entries = this.getCurrentWeekEntries().sort((a, b) => {
            const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        });

        if (entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No entries for this week</td></tr>';
            return;
        }

        tbody.innerHTML = entries.map(entry => `
            <tr>
                <td>${entry.day}</td>
                <td>
                    <span class="activity-badge ${this.getActivityClass(entry.activity)}">${entry.activity}</span>
                </td>
                <td>${entry.specificItem}</td>
                <td class="text-right font-bold">${entry.hours}</td>
                <td>${entry.comments || '-'}</td>
                <td>
                    ${this.timesheetStatus === 'Draft' ? 
                        `<button class="action-btn delete" onclick="app.deleteEntry(${entry.id})">Delete</button>` : 
                        '<span class="text-secondary">Locked</span>'
                    }
                </td>
            </tr>
        `).join('');
    }

    getActivityClass(activity) {
        return activity.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
    }

    deleteEntry(entryId) {
        if (this.timesheetStatus === 'Locked') {
            alert('This timesheet is locked and cannot be modified.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== entryId);
            this.updateUI();
            this.updateReports(); // Update reports after deletion
        }
    }

    submitTimesheet() {
        if (this.timesheetStatus === 'Locked') {
            alert('This timesheet is already locked.');
            return;
        }

        const weeklyTotal = this.calculateWeeklyTotal();
        if (weeklyTotal === 0) {
            alert('Cannot submit empty timesheet.');
            return;
        }

        if (confirm(`Submit timesheet for week of ${this.currentWeek}? This will lock the timesheet from further changes.`)) {
            this.timesheetStatus = 'Locked';
            this.updateUI();
            alert('Timesheet submitted and locked successfully.');
        }
    }

    // Reports functionality
    updateReports() {
        this.updateActivitySummary();
        this.updateReportsTable();
    }

    updateActivitySummary() {
        const summary = {};
        this.entries.forEach(entry => {
            if (!summary[entry.activity]) {
                summary[entry.activity] = 0;
            }
            summary[entry.activity] += entry.hours;
        });

        const summaryContainer = document.getElementById('activitySummary');
        if (!summaryContainer) return;
        
        const activities = ['Project Design', 'Project Factory', 'Sales', 'R&D', 'Vacation', 'Misc'];
        
        summaryContainer.innerHTML = activities.map(activity => `
            <div class="activity-summary-item">
                <h5 class="${this.getActivityClass(activity)}">${activity}</h5>
                <div class="hours">${(summary[activity] || 0).toFixed(1)}</div>
                <div class="text-secondary">hours</div>
            </div>
        `).join('');
    }

    updateReportsTable() {
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;
        
        const filteredEntries = this.getFilteredEntries();

        if (filteredEntries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No entries match the current filters</td></tr>';
            return;
        }

        tbody.innerHTML = filteredEntries.map(entry => `
            <tr>
                <td>${entry.employee}</td>
                <td>${entry.week}</td>
                <td>${entry.day}</td>
                <td>
                    <span class="activity-badge ${this.getActivityClass(entry.activity)}">${entry.activity}</span>
                </td>
                <td>${entry.specificItem}</td>
                <td class="text-right font-bold">${entry.hours}</td>
                <td>${entry.comments || '-'}</td>
            </tr>
        `).join('');
    }

    getFilteredEntries() {
        const employeeFilter = document.getElementById('filterEmployee')?.value || '';
        const activityFilter = document.getElementById('filterActivity')?.value || '';
        const projectFilter = document.getElementById('filterProject')?.value?.toLowerCase() || '';

        return this.entries.filter(entry => {
            if (employeeFilter && entry.employee !== employeeFilter) return false;
            if (activityFilter && entry.activity !== activityFilter) return false;
            if (projectFilter && !entry.specificItem.toLowerCase().includes(projectFilter)) return false;
            return true;
        });
    }

    populateFilterEmployees() {
        const employeeSelect = document.getElementById('filterEmployee');
        if (!employeeSelect) return;
        
        const employees = [...new Set(this.entries.map(entry => entry.employee))];
        
        employeeSelect.innerHTML = '<option value="">All Employees</option>' +
            employees.map(emp => `<option value="${emp}">${emp}</option>`).join('');
    }

    applyFilters() {
        this.updateReports();
    }

    clearFilters() {
        const filterEmployee = document.getElementById('filterEmployee');
        const filterActivity = document.getElementById('filterActivity');
        const filterProject = document.getElementById('filterProject');
        
        if (filterEmployee) filterEmployee.value = '';
        if (filterActivity) filterActivity.value = '';
        if (filterProject) filterProject.value = '';
        
        this.updateReports();
    }

    exportCSV() {
        const filteredEntries = this.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            alert('No data to export.');
            return;
        }

        const headers = ['Employee', 'Week', 'Day', 'Activity', 'Specific Item', 'Hours', 'Comments'];
        const csvContent = [
            headers.join(','),
            ...filteredEntries.map(entry => [
                entry.employee,
                entry.week,
                entry.day,
                entry.activity,
                entry.specificItem,
                entry.hours,
                `"${(entry.comments || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timesheet_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the application when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new TimeTrackingApp();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!app) app = new TimeTrackingApp();
    });
} else {
    app = new TimeTrackingApp();
}

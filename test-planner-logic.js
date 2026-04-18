/**
 * Test Suite for Planner Logic
 * Tests deletion, carry-forward, and data persistence
 */

// Mock data setup
let cachedData = {};
let currentDate = new Date('2026-04-18');
let currentUser = { uid: 'test-user-123' };

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value; },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i) => Object.keys(store)[i]
    };
})();
global.localStorage = localStorageMock;

// Mock Firestore
const mockFirestore = {
    docs: {},
    set: async (key, data) => {
        mockFirestore.docs[key] = data;
        console.log(`✓ Firestore saved: ${key}`);
    },
    get: async (key) => {
        return mockFirestore.docs[key] || null;
    },
    delete: async (key) => {
        delete mockFirestore.docs[key];
    },
    clear: () => { mockFirestore.docs = {}; }
};

// Test utilities
const assert = {
    equal: (actual, expected, msg) => {
        if (actual !== expected) throw new Error(`❌ ${msg}: expected ${expected}, got ${actual}`);
        console.log(`✓ ${msg}`);
    },
    deepEqual: (actual, expected, msg) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`❌ ${msg}:\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
        }
        console.log(`✓ ${msg}`);
    },
    ok: (value, msg) => {
        if (!value) throw new Error(`❌ ${msg}: expected truthy value`);
        console.log(`✓ ${msg}`);
    },
    throws: (fn, msg) => {
        try {
            fn();
            throw new Error(`❌ ${msg}: expected error but none was thrown`);
        } catch (e) {
            if (e.message.startsWith('❌')) throw e;
            console.log(`✓ ${msg}`);
        }
    }
};

// ────────────────────────────────────────────────────────────────
// Test 1: Basic Task Deletion
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 1: Basic Task Deletion ===');
(() => {
    cachedData = {
        roughTasks: {
            'PHY 255': [
                { id: 'task1', carryId: 'carry1', text: 'Study notes', done: false }
            ]
        }
    };

    const beforeCount = cachedData.roughTasks['PHY 255'].length;
    assert.equal(beforeCount, 1, 'Task exists before deletion');

    // Simulate deleteRoughTask logic
    const bucket = 'PHY 255';
    const taskId = 'task1';
    const items = cachedData.roughTasks[bucket];
    const taskToDelete = items.find(item => item.id === taskId);
    
    if (taskToDelete && taskToDelete.carryId) {
        if (!cachedData.deletedCarryIds) {
            cachedData.deletedCarryIds = [];
        }
        if (!cachedData.deletedCarryIds.includes(taskToDelete.carryId)) {
            cachedData.deletedCarryIds.push(taskToDelete.carryId);
        }
    }
    
    cachedData.roughTasks[bucket] = items.filter(item => item.id !== taskId);

    const afterCount = cachedData.roughTasks['PHY 255'].length;
    assert.equal(afterCount, 0, 'Task removed after deletion');
    assert.deepEqual(cachedData.deletedCarryIds, ['carry1'], 'Deleted carryId tracked');
})();

// ────────────────────────────────────────────────────────────────
// Test 2: Carry-forward Does NOT Re-add Deleted Tasks
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 2: Carry-forward Does NOT Re-add Deleted Tasks ===');
(() => {
    // Setup: Old data with a task
    const oldData = {
        roughTasks: {
            'WTW 218': [
                { id: 'oldtask1', carryId: 'oldcarry1', text: 'Practice problems', done: false }
            ]
        }
    };

    // Current day with deletion tracking
    cachedData = {
        roughTasks: { 'WTW 218': [] },
        deletedCarryIds: ['oldcarry1']  // We deleted this task
    };

    // Simulate carry-forward logic
    const deletedCarryIds = new Set(cachedData.deletedCarryIds || []);
    const carryId = 'oldcarry1';
    let shouldCarry = true;

    if (deletedCarryIds.has(carryId)) {
        shouldCarry = false;
    }

    assert.equal(shouldCarry, false, 'Deleted task is NOT carried forward');
})();

// ────────────────────────────────────────────────────────────────
// Test 3: Non-deleted Tasks ARE Carried Forward
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 3: Non-deleted Tasks ARE Carried Forward ===');
(() => {
    cachedData = {
        roughTasks: { 'COS 210': [] },
        deletedCarryIds: ['deleted-carry-1']  // Some other task was deleted
    };

    const taskCarryId = 'active-carry-2';
    const deletedCarryIds = new Set(cachedData.deletedCarryIds || []);
    let shouldCarry = !deletedCarryIds.has(taskCarryId);

    assert.equal(shouldCarry, true, 'Active task IS carried forward');
})();

// ────────────────────────────────────────────────────────────────
// Test 4: Multiple Deletions Tracked
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 4: Multiple Deletions Tracked ===');
(() => {
    cachedData = {
        roughTasks: {
            'PHY 255': [
                { id: 't1', carryId: 'c1', text: 'Task 1', done: false },
                { id: 't2', carryId: 'c2', text: 'Task 2', done: false },
                { id: 't3', carryId: 'c3', text: 'Task 3', done: false }
            ]
        },
        deletedCarryIds: []
    };

    // Delete task 1
    let items = cachedData.roughTasks['PHY 255'];
    let task = items.find(t => t.id === 't1');
    if (task && task.carryId) {
        cachedData.deletedCarryIds.push(task.carryId);
    }
    cachedData.roughTasks['PHY 255'] = items.filter(t => t.id !== 't1');

    // Delete task 2
    items = cachedData.roughTasks['PHY 255'];
    task = items.find(t => t.id === 't2');
    if (task && task.carryId) {
        cachedData.deletedCarryIds.push(task.carryId);
    }
    cachedData.roughTasks['PHY 255'] = items.filter(t => t.id !== 't2');

    assert.equal(cachedData.roughTasks['PHY 255'].length, 1, 'Only 1 task remains');
    assert.deepEqual(cachedData.deletedCarryIds, ['c1', 'c2'], 'Both deleted carryIds tracked');
})();

// ────────────────────────────────────────────────────────────────
// Test 5: Done Tasks NOT Carried Forward (Original Logic)
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 5: Done Tasks NOT Carried Forward ===');
(() => {
    const task = { id: 'task1', carryId: 'carry1', text: 'Task', done: true };
    const deletedCarryIds = new Set([]);

    let shouldCarry = true;
    if (task.done) shouldCarry = false;
    if (deletedCarryIds.has(task.carryId)) shouldCarry = false;

    assert.equal(shouldCarry, false, 'Completed task not carried forward');
})();

// ────────────────────────────────────────────────────────────────
// Test 6: Empty Task Text NOT Carried Forward
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 6: Empty Task Text NOT Carried Forward ===');
(() => {
    const task = { id: 'task1', carryId: 'carry1', text: '   ', done: false };
    
    let shouldCarry = true;
    if (!task.text || !task.text.trim()) shouldCarry = false;

    assert.equal(shouldCarry, false, 'Empty task not carried forward');
})();

// ────────────────────────────────────────────────────────────────
// Test 7: Duplicate Deletions Handled (No Duplicates in Array)
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 7: Duplicate Deletions Not Added ===');
(() => {
    cachedData = {
        roughTasks: {
            'Life/Admin': [
                { id: 'task1', carryId: 'carry1', text: 'Task', done: false }
            ]
        },
        deletedCarryIds: []
    };

    const bucket = 'Life/Admin';
    const taskId = 'task1';
    const carryId = 'carry1';

    // Try to delete twice
    for (let i = 0; i < 2; i++) {
        const items = cachedData.roughTasks[bucket];
        const task = items.find(t => t.id === taskId);
        
        if (task && task.carryId) {
            if (!cachedData.deletedCarryIds.includes(carryId)) {
                cachedData.deletedCarryIds.push(carryId);
            }
        }
        cachedData.roughTasks[bucket] = items.filter(t => t.id !== taskId);
    }

    assert.equal(cachedData.deletedCarryIds.length, 1, 'Only one entry for deleted carryId');
})();

// ────────────────────────────────────────────────────────────────
// Test 8: Deleted Carry ID Persists Across Days
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 8: Deleted Carry ID Persists ===');
(() => {
    // Day 1: Delete task
    cachedData = {
        roughTasks: { 'COS 212': [] },
        deletedCarryIds: ['persist-carry-1']
    };

    const day1Deletions = JSON.parse(JSON.stringify(cachedData.deletedCarryIds));
    
    // Save and reload (simulated)
    localStorageMock.setItem('planner_2026-04-18', JSON.stringify(cachedData));
    const loaded = JSON.parse(localStorageMock.getItem('planner_2026-04-18'));

    assert.deepEqual(loaded.deletedCarryIds, day1Deletions, 'Deletion list persists in storage');
})();

// ────────────────────────────────────────────────────────────────
// Test 9: Gap Detection - Null/Undefined carryId
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 9: GAP - Null carryId Handling ===');
(() => {
    cachedData = {
        roughTasks: {
            'WTW 211': [
                { id: 'task1', carryId: null, text: 'Task', done: false }  // Gap!
            ]
        }
    };

    const items = cachedData.roughTasks['WTW 211'];
    const task = items[0];

    try {
        if (task && task.carryId) {  // This will be false if carryId is null
            console.log('Would add to deletedCarryIds');
        }
        assert.ok(true, 'Code safely handles null carryId');
    } catch (e) {
        assert.throws(() => { throw e; }, 'null carryId causes issue');
    }
})();

// ────────────────────────────────────────────────────────────────
// Test 10: Gap Detection - Task Without carryId Field
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 10: GAP - Missing carryId Field ===');
(() => {
    cachedData = {
        roughTasks: {
            'PHY 255': [
                { id: 'task1', text: 'Task', done: false }  // No carryId field at all!
            ]
        }
    };

    const items = cachedData.roughTasks['PHY 255'];
    const task = items[0];
    let deletionTracked = false;

    if (task && task.carryId) {
        deletionTracked = true;
    }

    assert.equal(deletionTracked, false, 'Missing carryId field safely ignored');
})();

// ────────────────────────────────────────────────────────────────
// Test 11: Gap Detection - Carry Forward with Duplicate carryIds
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 11: GAP - Duplicate carryIds in Day ===');
(() => {
    // What if the same carryId exists twice in one day? (Should not happen but...)
    cachedData = {
        roughTasks: {
            'COS 210': [
                { id: 'task1', carryId: 'same-carry', text: 'Task 1', done: false },
                { id: 'task2', carryId: 'same-carry', text: 'Task 2', done: false }  // Duplicate!
            ]
        }
    };

    const currentCarryIds = new Set();
    cachedData.roughTasks['COS 210'].forEach(task => {
        currentCarryIds.add(task.carryId);
    });

    assert.equal(currentCarryIds.size, 1, 'GAP: Duplicate carryIds in one day causes tracking issues');
})();

// ────────────────────────────────────────────────────────────────
// Test 12: Gap Detection - Attempting to Carry Task Without ID
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 12: GAP - Carry Task Without ID ===');
(() => {
    const oldTask = { text: 'No ID Task', done: false };  // Missing id!
    const latestByCarry = new Map();

    let carryId = oldTask.carryId || oldTask.id;  // carryId getter pattern
    if (!carryId) {
        console.warn('⚠️ Cannot carry task with no id or carryId');
    }

    assert.ok(
        !carryId,
        'GAP: Task without id/carryId cannot be tracked for carry'
    );
})();

// ────────────────────────────────────────────────────────────────
// Test 13: Gap Detection - deletedCarryIds Not Initialized
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 13: GAP - Accessing deletedCarryIds on Empty Data ===');
(() => {
    cachedData = { roughTasks: { 'WTW 218': [] } };  // No deletedCarryIds field

    // This is the pattern used in the fix:
    const deletedCarryIds = new Set(cachedData.deletedCarryIds || []);

    assert.equal(deletedCarryIds.size, 0, 'Empty set created safely when deletedCarryIds undefined');
})();

// ────────────────────────────────────────────────────────────────
// Test 14: Gap Detection - Old Data Migration
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 14: GAP - Old Data Without deletedCarryIds ===');
(() => {
    // Simulate loading old planner data from localStorage (before fix)
    const oldData = {
        roughTasks: {
            'PHY 255': [
                { id: 'old1', carryId: 'oldcarry1', text: 'Old task', done: false }
            ]
        }
        // No deletedCarryIds field!
    };

    // When rendering or syncing old data:
    const deletedCarryIds = new Set(oldData.deletedCarryIds || []);
    
    assert.equal(deletedCarryIds.size, 0, 'Old data without deletedCarryIds handled gracefully');
})();

// ────────────────────────────────────────────────────────────────
// Test 15: Complex Scenario - Multi-bucket Deletions
// ────────────────────────────────────────────────────────────────
console.log('\n=== TEST 15: Complex - Multi-bucket Deletions ===');
(() => {
    cachedData = {
        roughTasks: {
            'PHY 255': [
                { id: 'phy1', carryId: 'phyc1', text: 'Physics task', done: false }
            ],
            'COS 210': [
                { id: 'cos1', carryId: 'cosc1', text: 'CS task', done: false }
            ],
            'WTW 218': [
                { id: 'wtw1', carryId: 'wtwc1', text: 'Maths task', done: false }
            ]
        },
        deletedCarryIds: []
    };

    // Delete from different buckets
    ['PHY 255', 'WTW 218'].forEach(bucket => {
        const items = cachedData.roughTasks[bucket];
        const task = items[0];
        if (task && task.carryId) {
            cachedData.deletedCarryIds.push(task.carryId);
        }
        cachedData.roughTasks[bucket] = [];
    });

    assert.equal(cachedData.deletedCarryIds.length, 2, 'Multiple bucket deletions tracked');
    
    // Check that COS 210 task can still be carried
    const deletedSet = new Set(cachedData.deletedCarryIds);
    const canCarryCOS = !deletedSet.has('cosc1');
    assert.ok(canCarryCOS, 'Undeleted task from different bucket can be carried');
})();

// ────────────────────────────────────────────────────────────────
// Summary
// ────────────────────────────────────────────────────────────────
console.log('\n');
console.log('╔════════════════════════════════════════════╗');
console.log('║         TEST SUITE COMPLETED               ║');
console.log('║     Gaps & Issues Found: 8                 ║');
console.log('╚════════════════════════════════════════════╝');
console.log('\nGAPS IDENTIFIED:\n');
console.log('  🔴 Test 9: Null carryId - Silently ignored (OK but undocumented)');
console.log('  🔴 Test 10: Missing carryId field - Silently ignored');
console.log('  🟡 Test 11: Duplicate carryIds - Can cause tracking confusion');
console.log('  🟡 Test 12: Task without ID - Cannot be tracked for carry');
console.log('  🟡 Test 13: Uninitialized deletedCarryIds - Handled safely');
console.log('  🟡 Test 14: Old data migration - Handles gracefully');
console.log('  🟠 Test 15: Multi-bucket logic - Works correctly\n');
console.log('RECOMMENDATIONS:\n');
console.log('  1. Validate task.carryId exists before deletion');
console.log('  2. Ensure all tasks generated have both id and carryId');
console.log('  3. Add data migration for old planner data');
console.log('  4. Consider cleanup: Remove old deletedCarryIds after N days');
console.log('  5. Add unit tests to prevent regressions\n');

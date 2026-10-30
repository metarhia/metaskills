'use strict';

const PERMISSIONS = {
  admin: ['read:balance', 'read:transactions', 'write:transactions'],
  user: ['read:balance'],
  guest: [],
};

const accessPolicy = {
  check(role, permission) {
    const granted = PERMISSIONS[role] ?? [];
    return granted.includes(permission);
  },
};

// Context: capabilities and request state passed in, never imported
const context = {
  console,
  accessPolicy,
  user: { name: 'Marcus', role: 'admin' },
};

// Class style: keep the context, read fields where needed
class AccountService {
  constructor(context) {
    this.context = context;
  }

  getBalance(accountId) {
    const { console, accessPolicy, user } = this.context;
    console.log(`User ${user.name} requesting balance for ${accountId}`);
    if (!accessPolicy.check(user.role, 'read:balance')) {
      console.error('Access denied: insufficient permissions');
      return null;
    }
    return 15420.5;
  }
}

// Closure style: destructure once, methods close over the fields
const createAccountService = (context) => {
  const { console, accessPolicy, user } = context;

  const getBalance = (accountId) => {
    console.log(`User ${user.name} requesting balance for ${accountId}`);
    if (!accessPolicy.check(user.role, 'read:balance')) {
      console.error('Access denied: insufficient permissions');
      return null;
    }
    return 15420.5;
  };

  const getTransactions = (accountId) => {
    if (!accessPolicy.check(user.role, 'read:transactions')) {
      console.error('Access denied: insufficient permissions');
      return null;
    }
    console.log(`User ${user.name} reading transactions for ${accountId}`);
    return ['TR-123', 'TR-456', 'TR-789'];
  };

  return { getBalance, getTransactions };
};

const accountService = new AccountService(context);
const accountServiceFn = createAccountService(context);

module.exports = {
  PERMISSIONS,
  accessPolicy,
  context,
  AccountService,
  createAccountService,
  accountService,
  accountServiceFn,
};

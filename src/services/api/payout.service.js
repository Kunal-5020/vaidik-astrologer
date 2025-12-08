// src/services/payout.service.js

import { apiClient } from './axios.instance';

class PayoutService {
  // ===== PAYOUT REQUESTS =====

  /**
   * Request a payout
   * POST /astrologer/payouts
   * @param {Object} data - { amount: number, bankDetails: { accountHolderName, accountNumber, ifscCode, bankName?, upiId? } }
   */
  async requestPayout(data) {
    try {
      console.log('💰 [PayoutService] Requesting payout:', {
        amount: data.amount,
        accountNumber: data.bankDetails.accountNumber.slice(-4), // Log last 4 digits only
      });

      const response = await apiClient.post('/astrologer/payouts', data);

      if (response.data.success) {
        console.log('✅ [PayoutService] Payout requested:', response.data.data);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to request payout');
    } catch (error) {
      console.error('❌ [PayoutService] Request payout error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Get payout requests with pagination
   * GET /astrologer/payouts?page=1&limit=20&status=pending
   * @param {Object} params - { page?: number, limit?: number, status?: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled' }
   */
  async getPayouts(params = {}) {
    try {
      const { page = 1, limit = 20, status } = params;

      console.log('📊 [PayoutService] Fetching payouts:', { page, limit, status });

      const response = await apiClient.get('/astrologer/payouts', {
        params: { page, limit, status },
      });

      if (response.data.success) {
        console.log('✅ [PayoutService] Payouts fetched:', {
          count: response.data.data.payouts.length,
          total: response.data.data.pagination.total,
        });
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch payouts');
    } catch (error) {
      console.error('❌ [PayoutService] Get payouts error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Get payout details by ID
   * GET /astrologer/payouts/:payoutId
   * @param {string} payoutId - Payout ID
   */
  async getPayoutDetails(payoutId) {
    try {
      console.log('📋 [PayoutService] Fetching payout details:', payoutId);

      const response = await apiClient.get(`/astrologer/payouts/${payoutId}`);

      if (response.data.success) {
        console.log('✅ [PayoutService] Payout details fetched');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch payout details');
    } catch (error) {
      console.error('❌ [PayoutService] Get payout details error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Get payout statistics
   * GET /astrologer/payouts/stats/summary
   */
  async getPayoutStats() {
    try {
      console.log('📊 [PayoutService] Fetching payout stats...');

      const response = await apiClient.get('/astrologer/payouts/stats/summary');

      if (response.data.success) {
        console.log('✅ [PayoutService] Payout stats fetched:', {
          totalEarned: response.data.data.totalEarned,
          withdrawable: response.data.data.withdrawableAmount,
          withdrawn: response.data.data.totalWithdrawn,
        });
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch payout stats');
    } catch (error) {
      console.error('❌ [PayoutService] Get payout stats error:', error.message);
      throw this._formatError(error);
    }
  }

  // ===== TRANSACTIONS =====

  /**
   * Get transaction history
   * GET /astrologer/transactions?page=1&limit=20&type=credit
   * @param {Object} params - { page?: number, limit?: number, type?: 'credit' | 'debit' }
   */
  async getTransactions(params = {}) {
    try {
      const { page = 1, limit = 20, type } = params;

      console.log('📊 [PayoutService] Fetching transactions:', { page, limit, type });

      const response = await apiClient.get('/astrologer/transactions', {
        params: { page, limit, type },
      });

      if (response.data.success) {
        console.log('✅ [PayoutService] Transactions fetched:', {
          count: response.data.data.transactions.length,
          total: response.data.data.pagination.total,
        });
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch transactions');
    } catch (error) {
      console.error('❌ [PayoutService] Get transactions error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Get transaction details by ID
   * GET /astrologer/transactions/:transactionId
   * @param {string} transactionId - Transaction ID
   */
  async getTransactionDetails(transactionId) {
    try {
      console.log('📋 [PayoutService] Fetching transaction details:', transactionId);

      const response = await apiClient.get(`/astrologer/transactions/${transactionId}`);

      if (response.data.success) {
        console.log('✅ [PayoutService] Transaction details fetched');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch transaction details');
    } catch (error) {
      console.error('❌ [PayoutService] Get transaction details error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Get earnings breakdown
   * GET /astrologer/earnings/breakdown?period=month
   * @param {string} period - 'week' | 'month' | 'year'
   */
  async getEarningsBreakdown(period = 'month') {
    try {
      console.log('📊 [PayoutService] Fetching earnings breakdown:', period);

      const response = await apiClient.get('/astrologer/earnings/breakdown', {
        params: { period },
      });

      if (response.data.success) {
        console.log('✅ [PayoutService] Earnings breakdown fetched');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch earnings breakdown');
    } catch (error) {
      console.error('❌ [PayoutService] Get earnings breakdown error:', error.message);
      throw this._formatError(error);
    }
  }

  // ===== BANK ACCOUNT MANAGEMENT =====

  /**
   * Get saved bank accounts
   * GET /astrologer/bank-accounts
   */
  async getBankAccounts() {
    try {
      console.log('🏦 [PayoutService] Fetching bank accounts...');

      const response = await apiClient.get('/astrologer/bank-accounts');

      if (response.data.success) {
        console.log('✅ [PayoutService] Bank accounts fetched:', response.data.data.accounts.length);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to fetch bank accounts');
    } catch (error) {
      console.error('❌ [PayoutService] Get bank accounts error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Add bank account
   * POST /astrologer/bank-accounts
   * @param {Object} data - { accountHolderName, accountNumber, ifscCode, bankName?, upiId? }
   */
  async addBankAccount(data) {
    try {
      console.log('🏦 [PayoutService] Adding bank account:', {
        accountHolder: data.accountHolderName,
        lastFourDigits: data.accountNumber.slice(-4),
      });

      const response = await apiClient.post('/astrologer/bank-accounts', data);

      if (response.data.success) {
        console.log('✅ [PayoutService] Bank account added');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to add bank account');
    } catch (error) {
      console.error('❌ [PayoutService] Add bank account error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Update bank account
   * PATCH /astrologer/bank-accounts/:accountId
   * @param {string} accountId - Bank account ID
   * @param {Object} data - Fields to update
   */
  async updateBankAccount(accountId, data) {
    try {
      console.log('🏦 [PayoutService] Updating bank account:', accountId);

      const response = await apiClient.patch(`/astrologer/bank-accounts/${accountId}`, data);

      if (response.data.success) {
        console.log('✅ [PayoutService] Bank account updated');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to update bank account');
    } catch (error) {
      console.error('❌ [PayoutService] Update bank account error:', error.message);
      throw this._formatError(error);
    }
  }

  /**
   * Delete bank account
   * DELETE /astrologer/bank-accounts/:accountId
   * @param {string} accountId - Bank account ID
   */
  async deleteBankAccount(accountId) {
    try {
      console.log('🏦 [PayoutService] Deleting bank account:', accountId);

      const response = await apiClient.delete(`/astrologer/bank-accounts/${accountId}`);

      if (response.data.success) {
        console.log('✅ [PayoutService] Bank account deleted');
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to delete bank account');
    } catch (error) {
      console.error('❌ [PayoutService] Delete bank account error:', error.message);
      throw this._formatError(error);
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Validate bank account number
   * @param {string} accountNumber - Bank account number
   * @returns {boolean}
   */
  validateAccountNumber(accountNumber) {
    const regex = /^[0-9]{9,18}$/;
    return regex.test(accountNumber);
  }

  /**
   * Validate IFSC code
   * @param {string} ifscCode - IFSC code
   * @returns {boolean}
   */
  validateIFSC(ifscCode) {
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regex.test(ifscCode);
  }

  /**
   * Validate UPI ID
   * @param {string} upiId - UPI ID
   * @returns {boolean}
   */
  validateUPI(upiId) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return regex.test(upiId);
  }

  /**
   * Format amount to Indian currency
   * @param {number} amount - Amount to format
   * @returns {string}
   */
  formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get payout status color
   * @param {string} status - Payout status
   * @returns {string} - Color hex code
   */
  getPayoutStatusColor(status) {
    const colors = {
      pending: '#F59E0B',     // Amber
      approved: '#3B82F6',    // Blue
      processing: '#8B5CF6',  // Purple
      completed: '#22C55E',   // Green
      rejected: '#EF4444',    // Red
      cancelled: '#6B7280',   // Gray
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Get payout status label
   * @param {string} status - Payout status
   * @returns {string}
   */
  getPayoutStatusLabel(status) {
    const labels = {
      pending: 'Pending Review',
      approved: 'Approved',
      processing: 'Processing',
      completed: 'Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };
    return labels[status] || 'Unknown';
  }

  /**
   * Format error for consumption
   * @private
   */
  _formatError(error) {
    const formattedError = {
      message: error.response?.data?.message || error.message || 'Operation failed',
      status: error.response?.status,
      data: error.response?.data,
    };

    // Handle validation errors
    if (Array.isArray(formattedError.message)) {
      formattedError.message = formattedError.message.join(', ');
    }

    return formattedError;
  }
}

export const payoutService = new PayoutService();
export default payoutService;

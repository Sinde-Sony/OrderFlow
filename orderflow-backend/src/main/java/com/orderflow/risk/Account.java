package com.orderflow.risk;

public class Account {

    private final String accountId;

    private long cashBalance;

    private long position;

    public Account(
            String accountId,
            long cashBalance,
            long position
    ) {
        this.accountId = accountId;
        this.cashBalance = cashBalance;
        this.position = position;
    }

    public String getAccountId() {
        return accountId;
    }

    public long getCashBalance() {
        return cashBalance;
    }

    public void setCashBalance(long cashBalance) {
        this.cashBalance = cashBalance;
    }

    public long getPosition() {
        return position;
    }

    public void setPosition(long position) {
        this.position = position;
    }
}
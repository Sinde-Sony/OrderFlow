package com.orderflow.risk;

import com.orderflow.model.Order;
import com.orderflow.model.OrderSide;
import org.springframework.stereotype.Component;

@Component
public class RiskManager {

    private static final long MAX_ORDER_QUANTITY = 10_000;

    public RiskResult validate(Account account, Order order) {

        // Maximum quantity check
        if (order.getQuantity() > MAX_ORDER_QUANTITY) {
            return RiskResult.rejected(
                    "Maximum order quantity exceeded"
            );
        }

        // BUY Risk Check
        if (order.getSide() == OrderSide.BUY) {

            long requiredCash =
                    order.getPrice() * order.getQuantity();

            if (account.getCashBalance() < requiredCash) {

                return RiskResult.rejected(
                        "Insufficient Funds"
                );
            }
        }

        // SELL Risk Check
        if (order.getSide() == OrderSide.SELL) {

            if (account.getPosition() < order.getQuantity()) {

                return RiskResult.rejected(
                        "Insufficient Position"
                );
            }
        }

        return RiskResult.approved();
    }
}
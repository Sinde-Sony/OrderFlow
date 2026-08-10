interface Props {
    cash: number;
    buyingPower: number;
    position: number;
}

export default function AccountPanel({
    cash,
    buyingPower,
    position
}: Props) {

    const formatMoney = (value: number) =>
        `$${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    return (
        <section className="panel account-panel">

            <div className="panel-heading">
                <div>
                    <span className="eyebrow">ACCOUNT</span>
                    <h2>Trading Account</h2>
                </div>
            </div>

            <div className="account-row">
                <span>Cash Balance</span>
                <strong>{formatMoney(cash)}</strong>
            </div>

            <div className="account-row">
                <span>Buying Power</span>
                <strong>{formatMoney(buyingPower)}</strong>
            </div>

            <div className="account-row">
                <span>Position</span>
                <strong>{position} AAPL</strong>
            </div>

            <div className="account-row">
                <span>Status</span>
                <strong className="positive">ACTIVE</strong>
            </div>

        </section>
    );
}
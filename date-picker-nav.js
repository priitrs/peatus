class DatePickerNav extends HTMLElement {

    constructor() {
        super();

        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);

        this.selectedDate = new Date(this.today);

        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    formatDate(date) {
        return date.toLocaleDateString("en-GB");
    }

    isToday(date) {
        return date.getTime() === this.today.getTime();
    }

    changeDate(days) {
        this.selectedDate.setDate(
            this.selectedDate.getDate() + days
        );

        // Do not allow dates before today
        if (this.selectedDate < this.today) {
            this.selectedDate = new Date(this.today);
        }

        this.render();

        this.dispatchEvent(new CustomEvent("date-change", {
            detail: {
                date: this.selectedDate
            }
        }));
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: Roboto, sans-serif;
                }
                
                button svg {
                    width: 22px;
                    height: 22px;
                
                    fill: none;
                    stroke: currentColor;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                
                    transition: transform 0.15s ease;
                }
                
                button:hover:not(:disabled) {
                    background: #f0f0f0;
                }
                
                button:hover:not(:disabled) svg {
                    transform: scale(1.15);
                }
                
                button:disabled {
                    opacity: 0.3;
                    cursor: default;
                }

                .date {
                    min-width: 100px;
                    text-align: center;
                    font-weight: bold;
                }
            </style>

            <div class="container">
                <button id="prev" ${this.isToday(this.selectedDate) ? "disabled" : ""}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <div class="date">
                    ${this.formatDate(this.selectedDate)}
                </div>

                <button id="next">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        `;

        this.shadowRoot
            .querySelector("#prev")
            .onclick = () => this.changeDate(-1);

        this.shadowRoot
            .querySelector("#next")
            .onclick = () => this.changeDate(1);
    }
}

customElements.define("date-picker-nav", DatePickerNav);
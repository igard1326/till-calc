// Mirrors Python_src/main.py

const form = document.getElementById("till-form");
const expectedFields = document.getElementById("expected-fields");
const actualFields = document.getElementById("actual-fields");
const output = document.getElementById("output");
const outputPlaceholder = document.getElementById("output-placeholder");

const startTime = performance.now();

function money(amount) {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
}

function buildFields(container, kind) {
    container.replaceChildren();

    POS_NAMES.forEach((name, index) => {
        const label = document.createElement("label");
        label.className = "field";
        label.htmlFor = `${kind}-${index}`;

        const title = document.createElement("span");
        title.className = "field-label";
        title.textContent = name;

        const input = document.createElement("input");
        input.type = "number";
        input.id = `${kind}-${index}`;
        input.name = `${kind}-${index}`;
        input.step = "0.01";
        input.min = "0";
        input.inputMode = "decimal";
        input.placeholder = "0.00";
        input.required = true;

        const prefix = document.createElement("span");
        prefix.className = "field-prefix";
        prefix.textContent = "$";

        const control = document.createElement("div");
        control.className = "field-control";
        control.append(prefix, input);

        label.append(title, control);
        container.append(label);
    });
}

function formatDuration(ms) {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toFixed(2)}s`;
}

function renderResults(actualValues, deltas) {
    const totalActual = actualValues.reduce((sum, value) => sum + value, 0);

    output.hidden = false;
    outputPlaceholder.hidden = true;
    output.replaceChildren();

    const total = document.createElement("p");
    total.className = "output-total";
    total.textContent = `Total Actual: ${money(totalActual)}`;

    const table = document.createElement("table");
    table.className = "output-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["POS", "Actual", "Delta"].forEach((label) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = label;
        headerRow.append(th);
    });
    thead.append(headerRow);

    const tbody = document.createElement("tbody");
    POS_NAMES.forEach((name, index) => {
        const delta = deltas[index];
        const flagged = Math.abs(delta) > THRESHOLD;
        const sign = delta >= 0 ? "+" : "";

        const row = document.createElement("tr");
        if (flagged) {
            row.className = "is-flagged";
        }

        const posCell = document.createElement("th");
        posCell.scope = "row";
        posCell.textContent = name;

        const actualCell = document.createElement("td");
        actualCell.textContent = money(actualValues[index]);

        const deltaCell = document.createElement("td");
        deltaCell.className = "output-delta";
        deltaCell.textContent = flagged
            ? `(${sign}${delta.toFixed(2)} !!!)`
            : `(${sign}${delta.toFixed(2)})`;

        row.append(posCell, actualCell, deltaCell);
        tbody.append(row);
    });

    table.append(thead, tbody);

    const timing = document.createElement("p");
    timing.className = "output-time";
    timing.textContent = `Time taken: ${formatDuration(performance.now() - startTime)}`;

    output.append(total, table, timing);
}

function clearResults() {
    output.hidden = true;
    outputPlaceholder.hidden = false;
    output.replaceChildren();
}

buildFields(expectedFields, "expected");
buildFields(actualFields, "actual");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const expected = getValues(form, "expected", POS_NAMES);
    if (!expected.ok) {
        clearResults();
        alert(expected.message);
        return;
    }

    const actual = getValues(form, "actual", POS_NAMES);
    if (!actual.ok) {
        clearResults();
        alert(actual.message);
        return;
    }

    // Matches Python_src/main.py (and practice): expected - actual
    const deltas = expected.values.map(
        (expectedValue, index) => expectedValue - actual.values[index],
    );

    renderResults(actual.values, deltas);
});

form.addEventListener("reset", () => {
    // Let the browser clear inputs first, then clear output.
    queueMicrotask(clearResults);
});

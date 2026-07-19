// Mirrors Python_src/func.py — reads amounts from the form instead of the terminal.

/**
 * Collect numeric values for each POS from inputs named `{kind}-{index}`.
 * @param {HTMLFormElement} form
 * @param {"expected" | "actual"} kind
 * @param {string[]} pointsOfSale
 * @returns {{ ok: true, values: number[] } | { ok: false, message: string }}
 */
function getValues(form, kind, pointsOfSale) {
    const values = [];

    for (let i = 0; i < pointsOfSale.length; i++) {
        const input = form.elements.namedItem(`${kind}-${i}`);
        if (!(input instanceof HTMLInputElement)) {
            return {
                ok: false,
                message: `Missing input for ${pointsOfSale[i]} (${kind}).`,
            };
        }

        const raw = input.value.trim();
        if (raw === "") {
            input.focus();
            return {
                ok: false,
                message: `Enter ${kind} for ${pointsOfSale[i]}.`,
            };
        }

        const value = Number(raw);
        if (!Number.isFinite(value)) {
            input.focus();
            return {
                ok: false,
                message: `Invalid number for ${pointsOfSale[i]} (${kind}).`,
            };
        }

        values.push(value);
    }

    return { ok: true, values };
}

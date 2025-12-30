export type WaterParams = {
    ph: number;
    free_chlorine: number;
    alkalinity: number;
    volume: number; // in Liters
};

export type Recommendation = {
    action: string;
    product: string;
    amount: string;
    reason: string;
    priority: number;
};

export const getRecommendations = (params: WaterParams, lang: string = 'en'): Recommendation[] => {
    const recs: Recommendation[] = [];
    const { ph, free_chlorine, alkalinity, volume } = params;
    const volM3 = volume / 1000;

    const isEs = lang === 'es';

    // 1. pH Logic
    if (ph < 7.2) {
        const diff = 7.4 - ph;
        const amountG = Math.round(volM3 * (diff / 0.1) * 10);
        recs.push({
            priority: 1,
            action: isEs ? "Subir pH" : "Increase pH",
            product: isEs ? "Incrementador de pH (Carbonato de Sodio)" : "pH Increaser (Sodium Carbonate)",
            amount: `${amountG} g`,
            reason: isEs
                ? `El pH está bajo (${ph}). Un pH ácido irrita ojos y daña equipos.`
                : `The pH is low (${ph}). Acidic water irritates eyes and damages equipment.`,
        });
    } else if (ph > 7.6) {
        const diff = ph - 7.4;
        const amountMl = Math.round(volM3 * (diff / 0.1) * 10);
        recs.push({
            priority: 1,
            action: isEs ? "Bajar pH" : "Decrease pH",
            product: isEs ? "Reductor de pH (Ácido Clorhídrico/Bisulfato)" : "pH Reducer (Muriatic Acid/Bisulfate)",
            amount: `${amountMl} ml/g`,
            reason: isEs
                ? `El pH está alto (${ph}). Reduce la eficacia del cloro y puede enturbiar el agua.`
                : `The pH is high (${ph}). It reduces chlorine effectiveness and can cloud water.`,
        });
    }

    // 2. Chlorine Logic
    if (free_chlorine < 1.0) {
        const target = 2.0;
        const diff = target - free_chlorine;
        const amountG = Math.round(volM3 * diff * 2);
        recs.push({
            priority: 2,
            action: isEs ? "Cloración de Choque" : "Shock Chlorination",
            product: isEs ? "Cloro Granulado (Dicloro)" : "Granular Chlorine (Dichlor)",
            amount: `${amountG} g`,
            reason: isEs
                ? `El nivel de cloro es insuficiente (${free_chlorine} ppm) para desinfectar el agua.`
                : `Chlorine level is insufficient (${free_chlorine} ppm) to disinfect water.`,
        });
    } else if (free_chlorine > 5.0) {
        recs.push({
            priority: 2,
            action: isEs ? "Esperar a que baje" : "Wait for decrease",
            product: isEs ? "Neutralización Natural (Sol/UV)" : "Natural Neutralization (Sun/UV)",
            amount: "0 g",
            reason: isEs
                ? `El cloro está alto (${free_chlorine} ppm). El sol lo reducirá naturalmente. Evita el uso hasta que baje de 5ppm.`
                : `Chlorine is high (${free_chlorine} ppm). The sun will naturally reduce it. Avoid use until below 5ppm.`,
        });
    }

    // 3. Alkalinity Logic
    if (alkalinity < 80) {
        const diff = 100 - alkalinity;
        const amountG = Math.round(volM3 * (diff / 10) * 18);
        recs.push({
            priority: 3,
            action: isEs ? "Subir Alcalinidad" : "Increase Alkalinity",
            product: isEs ? "Bicarbonato de Sodio" : "Sodium Bicarbonate",
            amount: `${amountG} g`,
            reason: isEs
                ? `La alcalinidad baja (${alkalinity} ppm) hace que el pH sea inestable.`
                : `Low alkalinity (${alkalinity} ppm) makes pH unstable.`,
        });
    }

    return recs.sort((a, b) => a.priority - b.priority);
};

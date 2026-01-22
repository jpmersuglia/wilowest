export const events = [
    {
        id: "market_boom",
        eventName: "Auge del Mercado",
        eventDescription: "La demanda de productos ha aumentado inesperadamente debido a una tendencia global. Los precios de venta podrían dispararse.",
        eventAffects: "money",
        options: [
            {
                description: "Invertir en marketing agresivo",
                outcomeDescription: "Lanzar una campaña masiva para capitalizar la demanda.",
                successRate: 0.7,
                successEffect: { type: "money_multiplier", value: 1.5, message: "¡La campaña fue un éxito! Las ganancias aumentaron un 50%." },
                failEffect: { type: "money_loss", value: 5000, message: "La campaña fracasó y costó $5,000." }
            },
            {
                description: "Mantener producción normal",
                outcomeDescription: "Seguir operando sin riesgos adicionales, aprovechando la subida natural.",
                successRate: 1.0,
                successEffect: { type: "money_multiplier", value: 1.1, message: "Ganancias estables con un pequeño aumento del 10% por la demanda." },
                failEffect: null
            },
            {
                description: "Vender excedentes a bajo precio",
                outcomeDescription: "Deshacerse del stock acumulado rápidamente para obtener efectivo inmediato.",
                successRate: 0.9,
                successEffect: { type: "lump_sum", value: 10000, message: "Se vendieron los excedentes por $10,000 rápidos." },
                failEffect: { type: "reputational_hit", value: 0, message: "Nadie quiso los excedentes." }
            }
        ]
    },
    {
        id: "tech_breakthrough",
        eventName: "Avance Tecnológico",
        eventDescription: "Tus científicos creen estar al borde de un descubrimiento importante.",
        eventAffects: "research",
        options: [
            {
                description: "Financiar equipamiento experimental ($10,000)",
                outcomeDescription: "Comprar equipo de última generación para asegurar el avance.",
                successRate: 0.6,
                successEffect: { type: "research_points", value: 50, message: "¡Éxito! Obvios avances en investigación (+50 Puntos)." },
                failEffect: { type: "money_loss", value: 10000, message: "El equipo falló y el dinero se perdió." }
            },
            {
                description: "Presionar al equipo para trabajar horas extra",
                outcomeDescription: "Exigir resultados rápidos sin costo monetario adicional.",
                successRate: 0.4,
                successEffect: { type: "research_points", value: 30, message: "El equipo logró un avance bajo presión (+30 Puntos)." },
                failEffect: { type: "morale_loss", value: 0, message: "El equipo está agotado y no logró nada." }
            },
            {
                description: "Esperar resultados naturales",
                outcomeDescription: "Dejar que la investigación siga su curso normal.",
                successRate: 0.8,
                successEffect: { type: "research_points", value: 10, message: "Un pequeño avance natural (+10 Puntos)." },
                failEffect: { type: "nothing", value: 0, message: "No hubo avances significativos." }
            }
        ]
    },
    {
        id: "resource_shortage",
        eventName: "Escasez de Suministros",
        eventDescription: "Un bloqueo en la cadena de suministro está afectando la entrada de recursos básicos.",
        eventAffects: "resources",
        options: [
            {
                description: "Buscar proveedores alternativos (Costoso)",
                outcomeDescription: "Pagar una prima alta para asegurar el suministro desde otra fuente.",
                successRate: 0.8,
                successEffect: { type: "resource_gain", resource: "logistics", value: 100, message: "Nuevos proveedores encontrados. +100 Logística." },
                failEffect: { type: "money_loss", value: 15000, message: "Los proveedores alternativos eran una estafa. Perdiste $15,000." }
            },
            {
                description: "Racionar recursos actuales",
                outcomeDescription: "Implementar medidas de austeridad para estirar los recursos.",
                successRate: 0.5,
                successEffect: { type: "efficiency_boost", value: 0, message: "El racionamiento funcionó sin afectar la producción." },
                failEffect: { type: "production_dip", value: 0.2, message: "La producción cayó un 20% temporalmente." }
            },
            {
                description: "Ignorar y esperar",
                outcomeDescription: "No hacer nada y esperar que el problema se resuelva solo.",
                successRate: 0.2,
                successEffect: { type: "lucky", value: 0, message: "El bloqueo se resolvió solo milagrosamente." },
                failEffect: { type: "resource_loss_all", value: 0.1, message: "Perdiste un 10% de todos los recursos almacenados." }
            }
        ]
    }
];

/** Localization strings for Celera */
export type CeleraStrings = {
    buttonSplit: string;
    buttonClose: string;
    tooltipTooSmallToSplit: string;
    tooltipCannotChange: string;
};

export type CeleraStringKey = keyof CeleraStrings;

/**
 * Localization strings for Celera
 */
export const STRINGS: Record<string, CeleraStrings> = {
    en: {
        buttonSplit: "Split",
        buttonClose: "Close",
        tooltipTooSmallToSplit: "This widget is too small to split",
        tooltipCannotChange:
            "This widget is required and cannot be changed or removed",
    },
    "zh-CN": {
        buttonSplit: "分割",
        buttonClose: "关闭",
        tooltipTooSmallToSplit: "部件太小了，无法分割",
        tooltipCannotChange: "无法更改或移除必需的部件",
    },
    "zh-TW": {
        buttonSplit: "分割",
        buttonClose: "關閉",
        tooltipTooSmallToSplit: "部件太小了，無法分割",
        tooltipCannotChange: "無法更改或移除必需的部件",
    },
    es: {
        buttonSplit: "Dividir",
        buttonClose: "Cerrar",
        tooltipTooSmallToSplit: "Este widget es demasiado pequeño para dividir",
        tooltipCannotChange:
            "Este widget es necesario y no se puede cambiar ni eliminar",
    },
    fr: {
        buttonSplit: "Diviser",
        buttonClose: "Fermer",
        tooltipTooSmallToSplit: "Ce widget est trop petit pour être divisé",
        tooltipCannotChange:
            "Ce widget est requis et ne peut pas être changé ou supprimé",
    },
    de: {
        buttonSplit: "Teilen",
        buttonClose: "Schließen",
        tooltipTooSmallToSplit: "Dieses Widget ist zu klein zum Teilen",
        tooltipCannotChange:
            "Dieses Widget ist erforderlich und kann nicht geändert oder entfernt werden",
    },
    ja: {
        buttonSplit: "分割",
        buttonClose: "閉じる",
        tooltipTooSmallToSplit: "このウィジェットは小さすぎて分割できません",
        tooltipCannotChange:
            "このウィジェットは必要であり、変更または削除することはできません",
    },
};

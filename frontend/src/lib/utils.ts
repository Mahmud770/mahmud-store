export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('ar-SA', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);

export const formatNumber = (n: number) => new Intl.NumberFormat('ar-SA').format(n);

export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export const statusLabel: Record<string, { label: string; class: string }> = {
  pending:    { label: 'معلق',          class: 'badge-warning' },
  processing: { label: 'جاري التنفيذ',  class: 'badge-info'    },
  active:     { label: 'نشط',           class: 'badge-info'    },
  completed:  { label: 'مكتمل',         class: 'badge-success' },
  partial:    { label: 'مكتمل جزئياً',  class: 'badge-warning' },
  cancelled:  { label: 'ملغي',          class: 'badge-danger'  },
  refunded:   { label: 'مسترد',         class: 'badge-gray'    },
  open:       { label: 'مفتوح',         class: 'badge-info'    },
  answered:   { label: 'تم الرد',       class: 'badge-success' },
  closed:     { label: 'مغلق',          class: 'badge-gray'    },
  active_user:{ label: 'نشط',           class: 'badge-success' },
  suspended:  { label: 'موقوف',         class: 'badge-warning' },
  banned:     { label: 'محظور',         class: 'badge-danger'  },
};

export const clsx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

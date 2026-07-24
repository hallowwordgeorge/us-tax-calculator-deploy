// ---- Site search (shared across the main SPA and all state/salary/trust/article pages) ----
// Client-side only, no backend: searches the embedded article index + calculator presets,
// and (only where state-calc.js is also loaded, e.g. state/salary pages) all 51 states.
// currentLang must already be defined by the loading page (main SPA sets it directly;
// state-calc.js pages fix it from window.PAGE_LANG) before any of this runs.
const SEARCH_ARTICLES = [['What\'s New for 2026: How the One Big Beautiful Bill Act Affects Your Taxes','obbba-2026-changes'],['Standard vs. Itemized Deductions in 2026: Which Saves You More?','standard-vs-itemized-2026'],['Marginal vs. Effective Tax Rate: Understanding What You Really Pay','marginal-vs-effective-rate'],['The Complete Guide to Self-Employment Tax: Understanding the 15.3%','self-employment-tax-guide'],['Child Tax Credit 2026: Rules, Amounts, and Phase-Outs Explained','child-tax-credit-2026'],['Long-Term Capital Gains Tax: The 0%, 15%, and 20% Brackets Explained','long-term-capital-gains'],['Tax Filing Deadlines 2026: Every Date You Need to Know','tax-filing-deadlines-2026'],['Tax Withholding and Form W-4: How to Stop Overpaying or Owing at Tax Time','w4-withholding-guide'],['Commonly Overlooked Tax Deductions and Credits: A Checklist','overlooked-deductions-credits'],['401(k), Traditional IRA, and Roth IRA: How Each One Is Taxed','retirement-accounts-taxes'],['Married Filing Jointly vs. Separately: Which Should You Choose?','married-filing-jointly-vs-separately'],['Head of Household Filing Status: Who Qualifies and Why It Pays to Check','head-of-household-filing-status'],['Who Counts as a Dependent? Qualifying Child vs. Qualifying Relative, Explained','dependents-qualifying-child-relative'],['How Bonuses, Stock Options, and RSUs Are Actually Taxed','bonuses-stock-options-rsu-taxes'],['The Alternative Minimum Tax (AMT): What It Is and Who It Actually Affects','alternative-minimum-tax-amt-explained'],['Education Tax Credits: American Opportunity Credit vs. Lifetime Learning Credit','education-tax-credits-aotc-vs-llc'],['HSA vs. FSA: The Real Tax Differences','hsa-vs-fsa-tax-differences'],['Amending Your Tax Return: When and How to File Form 1040-X','amending-tax-return-1040x'],['Rental Property Income: How It\'s Actually Taxed','rental-property-income-taxes'],['Charitable Giving and Taxes: How Donations Actually Reduce Your Bill','charitable-giving-tax-deduction'],['Is Social Security Taxable? Understanding Tax on Retirement and Other Non-Wage Income','is-social-security-taxable'],['How to File Your Taxes for the First Time: A Complete Step-by-Step Guide','how-to-file-taxes-first-time'],['How to File Taxes as a Freelancer or 1099 Contractor: Step by Step','how-to-file-taxes-freelancer-1099'],['How to File Taxes With Both a W-2 Job and Freelance Income','how-to-file-taxes-w2-plus-freelance'],['How to File State and Federal Taxes Together: A Step-by-Step Walkthrough','how-to-file-state-and-federal-taxes'],['How to File Taxes After a Major Life Change: New Job, Marriage, or Side Income','how-to-file-taxes-after-life-change'],['How to File Taxes After Selling Stocks for the First Time','how-to-file-taxes-capital-gains-first-time'],['How to File Taxes in Retirement: Social Security, 401(k), and IRA Withdrawals','how-to-file-taxes-retirement-income'],['How to File Taxes as an International Student or Visa Holder','how-to-file-taxes-international-student'],['How to File Taxes If You Received Unemployment Income This Year','how-to-file-taxes-unemployment-income'],['How to File Taxes When You Owe Money and Can\'t Pay in Full','how-to-file-taxes-cant-pay-in-full'],['Earned Income Tax Credit (EITC) 2026: Who Qualifies and How Much You Can Get','earned-income-tax-credit-eitc'],['Net Investment Income Tax (NIIT): The 3.8% Surtax on Investment Income','net-investment-income-tax-niit'],['The Qualified Business Income (QBI) Deduction: The 20% Write-Off Explained','qualified-business-income-deduction-qbi'],['Selling Your Home: The $250,000/$500,000 Capital Gains Exclusion Explained','home-sale-capital-gains-exclusion'],['Quarterly Estimated Taxes: Safe Harbor Rules and How to Avoid the Underpayment Penalty','quarterly-estimated-taxes-safe-harbor'],['Cryptocurrency Taxes: Form 1099-DA, Cost Basis, and What Actually Triggers a Taxable Event','cryptocurrency-taxes-guide'],['1099 Forms Explained: NEC, MISC, DIV, INT, and K — What Each One Means for Your Taxes','1099-forms-explained'],['The Home Office Deduction: Simplified vs. Actual Expense Method','home-office-deduction'],['Divorce and Taxes: Filing Status, Alimony, and Claiming Kids After a Split','divorce-and-taxes'],['The Kiddie Tax: How a Child\'s Unearned Income Gets Taxed at the Parent\'s Rate','kiddie-tax-explained'],['Estate and Gift Tax Basics: The $15 Million Exemption and $19,000 Annual Exclusion','estate-and-gift-tax-basics'],['FBAR and FATCA: Reporting Foreign Bank Accounts and Assets','fbar-fatca-foreign-accounts'],['The Premium Tax Credit After the Enhanced Subsidies Expired: What Changed for 2026','premium-tax-credit-aca-subsidies'],['The 1031 Like-Kind Exchange: Deferring Capital Gains Tax on Real Estate','1031-like-kind-exchange'],['IRS Penalties Explained: Failure to File, Failure to Pay, and Accuracy-Related Penalties','irs-penalties-failure-to-file-pay'],['Innocent Spouse Relief: When You\'re Not Responsible for Your Spouse\'s Tax Debt','innocent-spouse-relief'],['Gambling and Lottery Winnings: How They\'re Taxed (and the New 90% Loss Limit)','gambling-lottery-winnings-tax'],['Tax-Loss Harvesting: Turning Investment Losses Into a Tax Break','tax-loss-harvesting'],['The Nanny Tax: Household Employment Taxes Explained','nanny-tax-household-employment'],['Employee Stock Purchase Plans (ESPP): How the Discount and Sale Are Taxed','espp-employee-stock-purchase-plan-taxes'],['No Tax on Tips: How the New $25,000 Deduction Actually Works','no-tax-on-tips-deduction-2026'],['No Tax on Overtime: How the New $12,500/$25,000 Deduction Works','no-tax-on-overtime-deduction-2026'],['The New Auto Loan Interest Deduction: Up to $10,000 on a US-Assembled Vehicle','auto-loan-interest-deduction-2026'],['The New $6,000 Senior Deduction: Who Qualifies and How the Phase-Out Works','senior-deduction-2026'],['Required Minimum Distributions: The Age-73 Rule and the 25% Penalty for Missing One','required-minimum-distributions-rmd'],['Inherited IRA Rules: The 10-Year Rule and When Annual RMDs Still Apply','inherited-ira-rules'],['Solo 401(k) vs. SEP-IRA: Retirement Plans for the Self-Employed','solo-401k-sep-ira-self-employed'],['Backdoor Roth IRA and Mega Backdoor Roth: How High Earners Still Get Roth Money In','backdoor-roth-ira-mega-backdoor'],['S-Corp Election for the Self-Employed: Is It Worth the Extra Complexity?','s-corp-election-self-employed'],['Section 179 and Bonus Depreciation: Writing Off Business Equipment in 2026','section-179-bonus-depreciation'],['The Self-Employed Health Insurance Deduction: An Above-the-Line Write-Off for Your Premiums','self-employed-health-insurance-deduction'],['The Adoption Tax Credit: Up to $17,670 for 2026','adoption-tax-credit'],['529 Plan Rules for 2026: Contribution Limits, Qualified Expenses, and the Roth IRA Rollover','529-plan-rules-2026'],['The Student Loan Interest Deduction: Up to $2,500, Even If You Don\'t Itemize','student-loan-interest-deduction'],['The Foreign Earned Income Exclusion: Excluding Up to $132,900 for 2026','foreign-earned-income-exclusion'],['The Foreign Tax Credit: Avoiding Double Taxation on Foreign Income','foreign-tax-credit'],['The Medical Expense Deduction: The 7.5% AGI Threshold Explained','medical-expense-deduction'],['The Multi-State Tax Credit: Avoiding Double State Taxation on the Same Income','multi-state-tax-credit-for-taxes-paid'],['Legal Settlements and Taxes: What\'s Taxable, What Isn\'t','legal-settlement-taxes'],['Hobby Loss Rules: When the IRS Says Your “Business” Is Actually a Hobby','hobby-loss-rules-section-183']];
const SEARCH_PRESETS = [
    [{en:'Federal Tax Calculator',zh:'联邦税计算器',es:'Calculadora de Impuesto Federal'}, '/#/'],
    [{en:'Self-Employment Tax',zh:'自雇税',es:'Impuesto de Cuenta Propia'}, '/#/self-employment'],
    [{en:'Capital Gains Tax',zh:'资本利得税',es:'Impuesto de Ganancias de Capital'}, '/#/capital-gains'],
    [{en:'Child Tax Credit',zh:'儿童税收抵免',es:'Crédito Tributario por Hijos'}, '/#/child-tax-credit'],
    [{en:'FICA / Payroll Tax',zh:'FICA 工资税',es:'Impuesto FICA / Nómina'}, '/#/fica'],
    [{en:'Salary Calculator by Amount',zh:'按收入金额查询',es:'Calculadora por Monto de Salario'}, '/calculator/'],
    [{en:'State Tax Map',zh:'州税地图',es:'Mapa de Impuestos Estatales'}, '/#/states'],
];
function siteSearchEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}
function siteSearchLang() {
    return (typeof currentLang !== 'undefined' && currentLang) ? currentLang : (window.PAGE_LANG || 'en');
}
function siteSearchPlaceholder() {
    var input = document.getElementById('siteSearchInput');
    if (!input) return;
    var lang = siteSearchLang();
    input.placeholder = input.getAttribute('data-ph-' + lang) || input.getAttribute('data-ph-en');
}
function runSiteSearch(query) {
    var box = document.getElementById('siteSearchResults');
    if (!box) return;
    var lang = siteSearchLang();
    query = (query || '').trim().toLowerCase();
    if (!query) { box.innerHTML = ''; return; }
    var results = [];
    SEARCH_PRESETS.forEach(function (p) {
        var label = p[0][lang] || p[0].en;
        if (label.toLowerCase().indexOf(query) !== -1) {
            results.push({ title: label, url: p[1], type: lang === 'zh' ? '计算器' : (lang === 'es' ? 'Calculadora' : 'Calculator') });
        }
    });
    SEARCH_ARTICLES.forEach(function (a) {
        if (a[0].toLowerCase().indexOf(query) !== -1) {
            results.push({ title: a[0], url: '/articles/' + a[1] + '/', type: lang === 'zh' ? '文章' : (lang === 'es' ? 'Artículo' : 'Article') });
        }
    });
    if (typeof STATE_NAMES !== 'undefined' && typeof STATE_SLUGS !== 'undefined') {
        Object.keys(STATE_NAMES).forEach(function (code) {
            var nm = STATE_NAMES[code][lang] || STATE_NAMES[code].en;
            if (nm && nm.toLowerCase().indexOf(query) !== -1 && STATE_SLUGS[code]) {
                results.push({ title: nm + (lang === 'zh' ? ' 州税' : ' State Tax'), url: '/' + STATE_SLUGS[code] + '-tax-calculator/', type: lang === 'zh' ? '州' : (lang === 'es' ? 'Estado' : 'State') });
            }
        });
    }
    results = results.slice(0, 10);
    if (!results.length) {
        box.innerHTML = '<div class="mega-search-empty">' + (lang === 'zh' ? '没有找到匹配结果' : (lang === 'es' ? 'No se encontraron resultados' : 'No results found')) + '</div>';
        return;
    }
    box.innerHTML = results.map(function (r) {
        return '<a class="mega-search-result" href="' + r.url + '"><span class="msr-title">' + siteSearchEsc(r.title) + '</span><span class="msr-type">' + r.type + '</span></a>';
    }).join('');
}
// Called by the nav's showFor() each time the Search panel's template is cloned into the
// live DOM — the input/results elements don't exist at page load anymore (they live inside
// a <template> until the user actually opens Search), so this can't be a load-time IIFE.
// Safe to call repeatedly: re-wires listeners on whatever #siteSearchInput exists right now.
function initSiteSearchWidget() {
    var input = document.getElementById('siteSearchInput');
    if (!input || input.dataset.siteSearchWired) return;
    input.dataset.siteSearchWired = '1';
    input.addEventListener('input', function () { runSiteSearch(input.value); });
    siteSearchPlaceholder();
}

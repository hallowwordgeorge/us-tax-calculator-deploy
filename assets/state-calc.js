/* ===================================================================
   US Tax Calculator — shared state-page engine
   Loaded by every /*-tax-calculator/ static page (51 of them: 50 states + DC).
   Contains: federal bracket data (2025/2026/2027), all-51 state tax rules,
   the pure calculation functions (copied verbatim from the main SPA's
   computeTax/computeStateTax so results always match the homepage), the
   US map injection + click-to-navigate logic, and the page bootstrap.
   Data source: same as the main calculator — IRS Rev. Proc. 2025-32 (federal),
   SSA (wage base), each state's own Department of Revenue for state brackets.
   =================================================================== */

        const STATE_NAMES = {
            AL:{en:'Alabama', zh:'阿拉巴马州'}, AK:{en:'Alaska', zh:'阿拉斯加州'}, AZ:{en:'Arizona', zh:'亚利桑那州'}, AR:{en:'Arkansas', zh:'阿肯色州'},
            CA:{en:'California', zh:'加利福尼亚州（加州）'}, CO:{en:'Colorado', zh:'科罗拉多州'}, CT:{en:'Connecticut', zh:'康涅狄格州'}, DE:{en:'Delaware', zh:'特拉华州'},
            DC:{en:'District of Columbia', zh:'华盛顿特区'}, FL:{en:'Florida', zh:'佛罗里达州'}, GA:{en:'Georgia', zh:'佐治亚州'}, HI:{en:'Hawaii', zh:'夏威夷州'},
            ID:{en:'Idaho', zh:'爱达荷州'}, IL:{en:'Illinois', zh:'伊利诺伊州'}, IN:{en:'Indiana', zh:'印第安纳州'}, IA:{en:'Iowa', zh:'爱荷华州'},
            KS:{en:'Kansas', zh:'堪萨斯州'}, KY:{en:'Kentucky', zh:'肯塔基州'}, LA:{en:'Louisiana', zh:'路易斯安那州'}, ME:{en:'Maine', zh:'缅因州'},
            MD:{en:'Maryland', zh:'马里兰州'}, MA:{en:'Massachusetts', zh:'马萨诸塞州（麻省）'}, MI:{en:'Michigan', zh:'密歇根州'}, MN:{en:'Minnesota', zh:'明尼苏达州'},
            MS:{en:'Mississippi', zh:'密西西比州'}, MO:{en:'Missouri', zh:'密苏里州'}, MT:{en:'Montana', zh:'蒙大拿州'}, NE:{en:'Nebraska', zh:'内布拉斯加州'},
            NV:{en:'Nevada', zh:'内华达州'}, NH:{en:'New Hampshire', zh:'新罕布什尔州'}, NJ:{en:'New Jersey', zh:'新泽西州'}, NM:{en:'New Mexico', zh:'新墨西哥州'},
            NY:{en:'New York', zh:'纽约州'}, NC:{en:'North Carolina', zh:'北卡罗来纳州（北卡）'}, ND:{en:'North Dakota', zh:'北达科他州'}, OH:{en:'Ohio', zh:'俄亥俄州'},
            OK:{en:'Oklahoma', zh:'俄克拉荷马州'}, OR:{en:'Oregon', zh:'俄勒冈州'}, PA:{en:'Pennsylvania', zh:'宾夕法尼亚州（宾州）'}, RI:{en:'Rhode Island', zh:'罗德岛州'},
            SC:{en:'South Carolina', zh:'南卡罗来纳州（南卡）'}, SD:{en:'South Dakota', zh:'南达科他州'}, TN:{en:'Tennessee', zh:'田纳西州'}, TX:{en:'Texas', zh:'德克萨斯州（德州）'},
            UT:{en:'Utah', zh:'犹他州'}, VT:{en:'Vermont', zh:'佛蒙特州'}, VA:{en:'Virginia', zh:'弗吉尼亚州'}, WA:{en:'Washington', zh:'华盛顿州'},
            WV:{en:'West Virginia', zh:'西弗吉尼亚州'}, WI:{en:'Wisconsin', zh:'威斯康星州'}, WY:{en:'Wyoming', zh:'怀俄明州'}
        };

        const STATE_TAX = {
            // t:'none' — no wage income tax
            AK:{t:'none'}, FL:{t:'none'}, NH:{t:'none', note:{en:'New Hampshire repealed its tax on interest & dividends starting 2025 — wage income is untaxed.', zh:'新罕布什尔州自 2025 年起取消利息与股息税——工资收入不征州税。'}}, NV:{t:'none'}, SD:{t:'none'}, TN:{t:'none'}, TX:{t:'none'}, WA:{t:'none', note:{en:'Washington has no wage income tax, but levies a 7% tax on long-term capital gains above ~$270,000 (not computed here).', zh:'华盛顿州不征工资所得税，但对超过约 $270,000 的长期资本利得征收 7% 税（此处未计算）。'}}, WY:{t:'none'},
            // t:'flat' — single flat rate
            AZ:{t:'flat', r:0.025}, CO:{t:'flat', r:0.044}, GA:{t:'flat', r:0.0519, ded:[12000,24000]}, IA:{t:'flat', r:0.038, note:{en:'Iowa moved to a 3.8% flat tax in 2025.', zh:'爱荷华州 2025 年起改为 3.8% 统一税率。'}}, ID:{t:'flat', r:0.05695}, IL:{t:'flat', r:0.0495, ded:[2825,5650]}, IN:{t:'flat', r:0.0295, note:{en:'Indiana counties levy an additional local income tax (not included).', zh:'印第安纳州各县另征地方所得税（未计入）。'}}, KY:{t:'flat', r:0.035}, LA:{t:'flat', r:0.03, note:{en:'Louisiana adopted a 3% flat tax in 2025.', zh:'路易斯安那州 2025 年起改为 3% 统一税率。'}}, MA:{t:'flat', r:0.05, ded:[4400,8800], surtax:{over:1083150, extra:0.04}, note:{en:'Includes the 4% surtax on income over ~$1,083,150.', zh:'已包含对超过约 $1,083,150 部分加征的 4% 附加税。'}}, MI:{t:'flat', r:0.0425, ded:[5800,11600]}, MS:{t:'flat', r:0.044}, NC:{t:'flat', r:0.0399, note:{en:'North Carolina rate shown is the 2026 rate (3.99%).', zh:'所示为北卡 2026 年税率（3.99%）。'}}, PA:{t:'flat', r:0.0307, ded:[0,0], note:{en:'Pennsylvania taxes income from the first dollar — no standard deduction. Many Pennsylvania municipalities levy a local earned income tax (not included).', zh:'宾州无标准扣除额，从第一美元起计税。宾州许多市镇另征地方所得税（未计入）。'}}, UT:{t:'flat', r:0.045},
            // t:'prog' — progressive brackets (single)
            AL:{t:'prog', b:[[500,0.02],[3000,0.04],[Infinity,0.05]]},
            AR:{t:'prog', b:[[4400,0.02],[8800,0.04],[Infinity,0.044]]},
            CA:{t:'prog', ded:[5706,11412], b:[[10756,0.01],[25512,0.02],[40245,0.04],[55866,0.06],[70606,0.08],[360659,0.093],[432787,0.103],[721314,0.113],[1000000,0.123],[Infinity,0.133]], note:{en:'California also levies ~1.1% SDI on wages (not included).', zh:'加州另对工资征收约 1.1% 的 SDI（未计入）。'}},
            CT:{t:'prog', ded:[0,0], b:[[10000,0.02],[50000,0.045],[100000,0.055],[200000,0.06],[250000,0.065],[500000,0.069],[Infinity,0.0699]], note:{en:'Connecticut taxes income from the first dollar — no standard deduction.', zh:'康涅狄格州无标准扣除额，从第一美元起计税。'}},
            DC:{t:'prog', b:[[10000,0.04],[40000,0.06],[60000,0.065],[250000,0.085],[500000,0.0925],[1000000,0.0975],[Infinity,0.1075]]},
            DE:{t:'prog', b:[[2000,0],[5000,0.022],[10000,0.039],[20000,0.048],[25000,0.052],[60000,0.0555],[Infinity,0.066]]},
            HI:{t:'prog', b:[[2400,0.014],[4800,0.032],[9600,0.055],[14400,0.064],[19200,0.068],[24000,0.072],[36000,0.076],[48000,0.079],[150000,0.09],[175000,0.10],[Infinity,0.11]]},
            KS:{t:'prog', ded:[3500,8000], b:[[15000,0.052],[Infinity,0.0558]]},
            MD:{t:'prog', b:[[1000,0.02],[2000,0.03],[3000,0.04],[100000,0.0475],[125000,0.05],[150000,0.0525],[250000,0.055],[Infinity,0.0575]], note:{en:'Maryland counties levy an additional 2.25%–3.2% local tax (not included).', zh:'马里兰州各县另征 2.25%–3.2% 地方税（未计入）。'}},
            ME:{t:'prog', b:[[24500,0.058],[58050,0.0675],[Infinity,0.0715]]},
            MN:{t:'prog', b:[[31690,0.0535],[104090,0.068],[193240,0.0785],[Infinity,0.0985]], note:{en:'Conforms to the federal standard deduction.', zh:'标准扣除额与联邦一致。'}},
            MO:{t:'prog', b:[[2473,0.02],[4946,0.025],[7419,0.03],[9892,0.035],[12365,0.04],[Infinity,0.047]], note:{en:'Conforms to the federal standard deduction.', zh:'标准扣除额与联邦一致。'}},
            MT:{t:'prog', b:[[20500,0.047],[Infinity,0.059]]},
            ND:{t:'prog', b:[[44725,0.0195],[Infinity,0.025]]},
            NE:{t:'prog', b:[[3700,0.0246],[22170,0.0351],[35730,0.0501],[Infinity,0.0455]]},
            NJ:{t:'prog', ded:[0,0], b:[[20000,0.014],[35000,0.0175],[40000,0.035],[75000,0.05525],[500000,0.0637],[1000000,0.0897],[Infinity,0.1075]], note:{en:'New Jersey taxes income from the first dollar — no standard deduction.', zh:'新泽西州无标准扣除额，从第一美元起计税。'}},
            NM:{t:'prog', b:[[5500,0.017],[11000,0.032],[16000,0.047],[210000,0.049],[Infinity,0.059]]},
            NY:{t:'prog', ded:[8000,16050], b:[[8500,0.04],[11700,0.045],[13900,0.0525],[21400,0.055],[80650,0.06],[215400,0.0685],[1077550,0.0965],[5000000,0.103],[Infinity,0.109]], note:{en:'NYC residents pay an additional city income tax of up to 3.876% (not included).', zh:'纽约市居民另缴最高 3.876% 的市所得税（未计入）。'}},
            OH:{t:'prog', ded:[0,0], b:[[26050,0],[100000,0.0275],[Infinity,0.035]], note:{en:'Ohio taxes income from the first dollar — no standard deduction. Ohio municipalities/school districts may levy local income tax (not included).', zh:'俄亥俄州无标准扣除额，从第一美元起计税。俄亥俄州市镇/学区可能另征地方所得税（未计入）。'}},
            OK:{t:'prog', ded:[6350,12700], b:[[1000,0.005],[2500,0.01],[3750,0.02],[4900,0.03],[7200,0.04],[Infinity,0.0475]]},
            OR:{t:'prog', b:[[4050,0.0475],[10200,0.0675],[125000,0.0875],[Infinity,0.099]]},
            RI:{t:'prog', b:[[77450,0.0375],[176050,0.0475],[Infinity,0.0599]]},
            SC:{t:'prog', b:[[3300,0],[17330,0.03],[Infinity,0.062]], note:{en:'Conforms to the federal standard deduction.', zh:'标准扣除额与联邦一致。'}},
            VA:{t:'prog', ded:[8000,16000], b:[[3000,0.02],[5000,0.03],[17000,0.05],[Infinity,0.0575]]},
            VT:{t:'prog', b:[[42150,0.0335],[102200,0.066],[165750,0.076],[Infinity,0.0875]]},
            WI:{t:'prog', b:[[13810,0.035],[27630,0.044],[304170,0.053],[Infinity,0.0765]]},
            WV:{t:'prog', b:[[10000,0.0236],[25000,0.0315],[40000,0.0354],[60000,0.0472],[Infinity,0.0512]]}
        };
        const TAX_DATA_BY_YEAR = {
            2025: {
                // OFFICIAL & FINAL — Rev. Proc. 2024-40 + OBBBA (retroactive 2025 changes).
                STANDARD_DEDUCTION: { single: 15750, married_joint: 31500, married_separate: 15750, head_household: 23625 },
                BRACKETS: {
                    single: [
                        { rate: 0.10, limit: 11925 }, { rate: 0.12, limit: 48475 },
                        { rate: 0.22, limit: 103350 }, { rate: 0.24, limit: 197300 },
                        { rate: 0.32, limit: 250525 }, { rate: 0.35, limit: 626350 }, { rate: 0.37, limit: Infinity }
                    ],
                    married_joint: [
                        { rate: 0.10, limit: 23850 }, { rate: 0.12, limit: 96950 },
                        { rate: 0.22, limit: 206700 }, { rate: 0.24, limit: 394600 },
                        { rate: 0.32, limit: 501050 }, { rate: 0.35, limit: 751600 }, { rate: 0.37, limit: Infinity }
                    ],
                    married_separate: [
                        { rate: 0.10, limit: 11925 }, { rate: 0.12, limit: 48475 },
                        { rate: 0.22, limit: 103350 }, { rate: 0.24, limit: 197300 },
                        { rate: 0.32, limit: 250525 }, { rate: 0.35, limit: 375800 }, { rate: 0.37, limit: Infinity }
                    ],
                    head_household: [
                        { rate: 0.10, limit: 17000 }, { rate: 0.12, limit: 64850 },
                        { rate: 0.22, limit: 103350 }, { rate: 0.24, limit: 197300 },
                        { rate: 0.32, limit: 250500 }, { rate: 0.35, limit: 626350 }, { rate: 0.37, limit: Infinity }
                    ]
                },
                LTCG_BRACKETS: {
                    single: [{ rate: 0.00, limit: 48350 }, { rate: 0.15, limit: 533400 }, { rate: 0.20, limit: Infinity }],
                    married_joint: [{ rate: 0.00, limit: 96700 }, { rate: 0.15, limit: 600050 }, { rate: 0.20, limit: Infinity }],
                    married_separate: [{ rate: 0.00, limit: 48350 }, { rate: 0.15, limit: 300000 }, { rate: 0.20, limit: Infinity }],
                    head_household: [{ rate: 0.00, limit: 64750 }, { rate: 0.15, limit: 566700 }, { rate: 0.20, limit: Infinity }]
                },
                SS_WAGE_BASE: 176100,
                CHILD_TAX_CREDIT: 2000,
                CHILD_TAX_CREDIT_REFUNDABLE: 1700
            },
            2026: {
                STANDARD_DEDUCTION: { single: 16100, married_joint: 32200, married_separate: 16100, head_household: 24150 },
                BRACKETS: {
                    single: [
                        { rate: 0.10, limit: 12400 }, { rate: 0.12, limit: 50400 },
                        { rate: 0.22, limit: 105700 }, { rate: 0.24, limit: 201775 },
                        { rate: 0.32, limit: 256225 }, { rate: 0.35, limit: 640600 }, { rate: 0.37, limit: Infinity }
                    ],
                    married_joint: [
                        { rate: 0.10, limit: 24800 }, { rate: 0.12, limit: 100800 },
                        { rate: 0.22, limit: 211400 }, { rate: 0.24, limit: 403550 },
                        { rate: 0.32, limit: 512450 }, { rate: 0.35, limit: 768700 }, { rate: 0.37, limit: Infinity }
                    ],
                    married_separate: [
                        { rate: 0.10, limit: 12400 }, { rate: 0.12, limit: 50400 },
                        { rate: 0.22, limit: 105700 }, { rate: 0.24, limit: 201775 },
                        { rate: 0.32, limit: 256225 }, { rate: 0.35, limit: 384350 }, { rate: 0.37, limit: Infinity }
                    ],
                    head_household: [
                        { rate: 0.10, limit: 17700 }, { rate: 0.12, limit: 67450 },
                        { rate: 0.22, limit: 105700 }, { rate: 0.24, limit: 201775 },
                        { rate: 0.32, limit: 256200 }, { rate: 0.35, limit: 640600 }, { rate: 0.37, limit: Infinity }
                    ]
                },
                LTCG_BRACKETS: {
                    single: [{ rate: 0.00, limit: 49450 }, { rate: 0.15, limit: 545500 }, { rate: 0.20, limit: Infinity }],
                    married_joint: [{ rate: 0.00, limit: 98900 }, { rate: 0.15, limit: 613700 }, { rate: 0.20, limit: Infinity }],
                    married_separate: [{ rate: 0.00, limit: 49450 }, { rate: 0.15, limit: 306850 }, { rate: 0.20, limit: Infinity }],
                    head_household: [{ rate: 0.00, limit: 66200 }, { rate: 0.15, limit: 579600 }, { rate: 0.20, limit: Infinity }]
                },
                SS_WAGE_BASE: 184500,
                CHILD_TAX_CREDIT: 2200,
                CHILD_TAX_CREDIT_REFUNDABLE: 1700
            },
            2027: {
                // PROJECTED — see note above. Not official IRS figures.
                STANDARD_DEDUCTION: { single: 16500, married_joint: 33000, married_separate: 16500, head_household: 24750 },
                BRACKETS: {
                    single: [
                        { rate: 0.10, limit: 12700 }, { rate: 0.12, limit: 51650 },
                        { rate: 0.22, limit: 108350 }, { rate: 0.24, limit: 206800 },
                        { rate: 0.32, limit: 262650 }, { rate: 0.35, limit: 656600 }, { rate: 0.37, limit: Infinity }
                    ],
                    married_joint: [
                        { rate: 0.10, limit: 25400 }, { rate: 0.12, limit: 103300 },
                        { rate: 0.22, limit: 216700 }, { rate: 0.24, limit: 413650 },
                        { rate: 0.32, limit: 525250 }, { rate: 0.35, limit: 787900 }, { rate: 0.37, limit: Infinity }
                    ],
                    married_separate: [
                        { rate: 0.10, limit: 12700 }, { rate: 0.12, limit: 51650 },
                        { rate: 0.22, limit: 108350 }, { rate: 0.24, limit: 206800 },
                        { rate: 0.32, limit: 262650 }, { rate: 0.35, limit: 393950 }, { rate: 0.37, limit: Infinity }
                    ],
                    head_household: [
                        { rate: 0.10, limit: 18150 }, { rate: 0.12, limit: 69150 },
                        { rate: 0.22, limit: 108350 }, { rate: 0.24, limit: 206800 },
                        { rate: 0.32, limit: 262600 }, { rate: 0.35, limit: 656600 }, { rate: 0.37, limit: Infinity }
                    ]
                },
                LTCG_BRACKETS: {
                    single: [{ rate: 0.00, limit: 50700 }, { rate: 0.15, limit: 559150 }, { rate: 0.20, limit: Infinity }],
                    married_joint: [{ rate: 0.00, limit: 101350 }, { rate: 0.15, limit: 629050 }, { rate: 0.20, limit: Infinity }],
                    married_separate: [{ rate: 0.00, limit: 50700 }, { rate: 0.15, limit: 314500 }, { rate: 0.20, limit: Infinity }],
                    head_household: [{ rate: 0.00, limit: 67850 }, { rate: 0.15, limit: 594100 }, { rate: 0.20, limit: Infinity }]
                },
                SS_WAGE_BASE: 193000,
                CHILD_TAX_CREDIT: 2250,
                CHILD_TAX_CREDIT_REFUNDABLE: 1750
            }
        };


// ---- URL slug for each state's dedicated page (code -> slug) ----
const STATE_SLUGS = {
    AL:'alabama', AK:'alaska', AZ:'arizona', AR:'arkansas', CA:'california', CO:'colorado',
    CT:'connecticut', DE:'delaware', DC:'washington-dc', FL:'florida', GA:'georgia', HI:'hawaii',
    ID:'idaho', IL:'illinois', IN:'indiana', IA:'iowa', KS:'kansas', KY:'kentucky', LA:'louisiana',
    ME:'maine', MD:'maryland', MA:'massachusetts', MI:'michigan', MN:'minnesota', MS:'mississippi',
    MO:'missouri', MT:'montana', NE:'nebraska', NV:'nevada', NH:'new-hampshire', NJ:'new-jersey',
    NM:'new-mexico', NY:'new-york', NC:'north-carolina', ND:'north-dakota', OH:'ohio', OK:'oklahoma',
    OR:'oregon', PA:'pennsylvania', RI:'rhode-island', SC:'south-carolina', SD:'south-dakota',
    TN:'tennessee', TX:'texas', UT:'utah', VT:'vermont', VA:'virginia', WA:'washington',
    WV:'west-virginia', WI:'wisconsin', WY:'wyoming'
};

let STANDARD_DEDUCTION = TAX_DATA_BY_YEAR[2026].STANDARD_DEDUCTION;
let currentLang = (function(){ try { return localStorage.getItem('lang') || 'en'; } catch(e){ return 'en'; } })();
function L(en, zh, es){ return currentLang === 'zh' ? zh : (currentLang === 'es' && es !== undefined ? es : en); }
function fmt(num){ return '$' + Number(num || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }
function fmtPctNum(r){ return (r * 100).toFixed(3).replace(/\.?0+$/, '') + '%'; }

// ---- Federal calculation (verbatim port of computeTax() from the main SPA — do not
// let this drift from index.html's version; the two must always agree). ----
function computeTax(selectedYear, inp) {
    const yearData = TAX_DATA_BY_YEAR[selectedYear] || TAX_DATA_BY_YEAR[2026];
    const SD_TABLE = yearData.STANDARD_DEDUCTION;
    const BR_TABLE = yearData.BRACKETS;
    const LTCG_TABLE = yearData.LTCG_BRACKETS;
    const SS_BASE = yearData.SS_WAGE_BASE;
    const CTC_PER_CHILD = yearData.CHILD_TAX_CREDIT;

    const status = inp.status, wages = inp.wages, seIncome = inp.seIncome,
          otherIncome = inp.otherIncome, ltcg = inp.ltcg,
          deductionType = inp.deductionType, itemizedAmount = inp.itemizedAmount,
          aboveLine = inp.aboveLine, children = inp.children,
          withheld = inp.withheld, isSE = inp.isSE;

    const grossIncome = wages + seIncome + otherIncome + ltcg;

    let seTaxDeduction = 0, seTax = 0, seTaxable = 0;
    if (isSE && seIncome > 0) {
        seTaxable = seIncome * 0.9235;
        const remainingSSBase = Math.max(0, SS_BASE - wages);
        const seSsPortion = Math.min(seTaxable, remainingSSBase);
        const seSsTax = seSsPortion * 0.124;
        const seMedicareTax = seTaxable * 0.029;
        seTax = seSsTax + seMedicareTax;
        seTaxDeduction = seTax * 0.5;
    }

    const agi = Math.max(0, grossIncome - aboveLine - seTaxDeduction);
    const standardDed = SD_TABLE[status];
    const deduction = deductionType === 'itemized' ? Math.max(itemizedAmount, standardDed) : standardDed;
    const ordinaryIncome = wages + seIncome + otherIncome - aboveLine - seTaxDeduction;
    const taxableOrdinary = Math.max(0, ordinaryIncome - deduction);

    const brackets = BR_TABLE[status];
    let remaining = taxableOrdinary;
    let federalTax = 0;
    let prevLimit = 0;
    let marginalRate = 0;
    const bracketBreakdown = [];

    for (const bracket of brackets) {
        const bracketSize = bracket.limit - prevLimit;
        const amountInBracket = Math.min(Math.max(0, remaining), bracketSize);
        const taxInBracket = amountInBracket * bracket.rate;
        if (amountInBracket > 0) {
            bracketBreakdown.push({
                rate: bracket.rate,
                range: `$${prevLimit.toLocaleString()} – $${bracket.limit === Infinity ? '∞' : bracket.limit.toLocaleString()}`,
                amount: amountInBracket, tax: taxInBracket
            });
            federalTax += taxInBracket;
            marginalRate = bracket.rate;
        }
        remaining -= amountInBracket;
        prevLimit = bracket.limit;
        if (remaining <= 0) break;
    }

    const ltbrackets = LTCG_TABLE[status];
    let ltcgRemaining = ltcg;
    let ltcgTax = 0;
    let ltcgPrev = 0;
    const taxableIncomeForLTCG = taxableOrdinary;

    for (const bracket of ltbrackets) {
        const bracketStart = Math.max(ltcgPrev, taxableIncomeForLTCG);
        const bracketEnd = bracket.limit;
        if (taxableIncomeForLTCG >= bracketEnd) { ltcgPrev = bracket.limit; continue; }
        const availableSpace = bracketEnd - bracketStart;
        const amountInBracket = Math.min(ltcgRemaining, availableSpace);
        if (amountInBracket > 0) { ltcgTax += amountInBracket * bracket.rate; ltcgRemaining -= amountInBracket; }
        ltcgPrev = bracket.limit;
        if (ltcgRemaining <= 0) break;
    }
    federalTax += ltcgTax;

    let ctc = 0;
    if (children > 0) {
        const phaseoutThreshold = (status === 'married_joint') ? 400000 : 200000;
        const phaseoutStart = Math.max(0, agi - phaseoutThreshold);
        const phaseoutAmount = Math.floor(phaseoutStart / 1000) * 50;
        ctc = Math.max(0, Math.min(children * CTC_PER_CHILD, children * CTC_PER_CHILD - phaseoutAmount));
    }
    const federalTaxAfterCredits = Math.max(0, federalTax - ctc);

    const ssTaxWages = Math.min(wages, SS_BASE) * 0.062;
    const medicareTaxWages = wages * 0.0145;
    const wageFica = ssTaxWages + medicareTaxWages;

    const addlMedicareThreshold = (status === 'married_joint') ? 250000
        : (status === 'married_separate' ? 125000 : 200000);
    const wageAddlMedicare = Math.max(0, wages - addlMedicareThreshold) * 0.009;
    const totalEarned = wages + seTaxable;
    const totalAddlMedicare = Math.max(0, totalEarned - addlMedicareThreshold) * 0.009;
    const seAddlMedicare = Math.max(0, totalAddlMedicare - wageAddlMedicare);
    const additionalMedicareTax = wageAddlMedicare + seAddlMedicare;

    const ficaTax = wageFica + wageAddlMedicare + seTax + seAddlMedicare;
    const ssTax = ssTaxWages, medicareTax = medicareTaxWages;

    const totalTax = federalTaxAfterCredits + ficaTax;
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome * 100) : 0;
    const refund = withheld - federalTaxAfterCredits - seTax - seAddlMedicare;

    return {
        taxYear: selectedYear, grossIncome, agi, standardDed, deduction,
        taxableOrdinary, taxableIncome: taxableOrdinary + ltcg,
        federalTax, ltcgTax, ctc, federalTaxAfterCredits,
        seTax, seTaxDeduction, ssTax, medicareTax, additionalMedicareTax,
        ficaTax, totalTax, effectiveRate, marginalRate, refund,
        bracketBreakdown
    };
}

// ---- State calculation (verbatim port of computeStateTax()/walkStateBrackets() from the main SPA) ----
function stateTopRate(st) {
    if (!st || st.t === 'none') return 0;
    if (st.t === 'flat') return st.r + (st.surtax ? st.surtax.extra : 0);
    return st.b[st.b.length - 1][1];
}

function walkStateBrackets(taxable, brackets, multiplier) {
    let tax = 0, prev = 0, topRate = 0;
    const breakdown = [];
    for (const pair of brackets) {
        const limit = pair[0], rate = pair[1];
        const lim = limit === Infinity ? Infinity : limit * multiplier;
        if (taxable > prev) {
            const amt = Math.min(taxable, lim) - prev;
            const t = amt * rate;
            tax += t;
            topRate = rate;
            breakdown.push({ rate: rate, from: prev, to: lim, amount: amt, tax: t });
            prev = lim;
        }
        if (taxable <= lim) break;
    }
    return { tax: tax, topRate: topRate, breakdown: breakdown };
}

function computeStateTax(code, income, status) {
    const st = STATE_TAX[code];
    if (!st || st.t === 'none') {
        return { type: 'none', tax: 0, effective: 0, topRate: 0, taxable: 0, breakdown: [] };
    }
    const ded = st.ded
        ? (status === 'married_joint' ? st.ded[1] : st.ded[0])
        : (STANDARD_DEDUCTION[status] || STANDARD_DEDUCTION.single);
    const taxable = Math.max(0, income - ded);
    let tax = 0, topRate = 0, breakdown = [];
    if (st.t === 'flat') {
        tax = taxable * st.r;
        topRate = taxable > 0 ? st.r : 0;
        if (st.surtax && taxable > st.surtax.over) {
            tax += (taxable - st.surtax.over) * st.surtax.extra;
            topRate = st.r + st.surtax.extra;
        }
    } else {
        const res = walkStateBrackets(taxable, st.b, status === 'married_joint' ? 2 : 1);
        tax = res.tax; topRate = res.topRate; breakdown = res.breakdown;
    }
    return { type: st.t, tax: tax, effective: income > 0 ? tax / income * 100 : 0, topRate: topRate, taxable: taxable, breakdown: breakdown };
}

// ---- Map: fetched once (browser-cached across all 51 pages), injected, click-to-navigate ----
let CURRENT_STATE_CODE = null;

function classForType(t) { return t === 'none' ? 'st-none' : (t === 'flat' ? 'st-flat' : 'st-prog'); }

function highlightMap(code) {
    document.querySelectorAll('#stateMap .stg').forEach(function (g) {
        const on = g.getAttribute('data-state') === code;
        g.classList.toggle('selected', on);
        const p = g.querySelector('.st-path');
        if (p) p.classList.toggle('selected', on);
    });
    const svg = document.getElementById('usMapSvg');
    if (svg) svg.classList.add('has-selection');
}

function goToStatePage(code) {
    const slug = STATE_SLUGS[code];
    if (!slug) return;
    if (code === CURRENT_STATE_CODE) return; // already here
    window.location.href = '/' + slug + '-tax-calculator/';
}

function initMap(selectedCode) {
    const mapWrap = document.getElementById('stateMap');
    if (!mapWrap) return;
    fetch('/assets/us-map.svg').then(function (r) { return r.text(); }).then(function (svg) {
        mapWrap.innerHTML = svg;
        highlightMap(selectedCode);
        mapWrap.addEventListener('click', function (e) {
            const p = e.target && e.target.closest ? e.target.closest('[data-state]') : null;
            if (p) goToStatePage(p.getAttribute('data-state'));
        });
        mapWrap.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const p = e.target && e.target.closest ? e.target.closest('[data-state]') : null;
            if (p) { e.preventDefault(); goToStatePage(p.getAttribute('data-state')); }
        });
    }).catch(function () { /* map is decorative on failure; calculator still works */ });
    const sel = document.getElementById('stateJumpSelect');
    if (sel) {
        sel.addEventListener('change', function () { if (this.value) goToStatePage(this.value); });
    }
}

// ---- Federal + state calculator (full form, used on every state page) ----
function toggleSEField() {
    const cb = document.getElementById('spIsSE');
    const wrap = document.getElementById('spSEWrap');
    if (wrap) wrap.style.display = (cb && cb.checked) ? 'block' : 'none';
}
function toggleItemizedField() {
    const sel = document.getElementById('spDeductionType');
    const wrap = document.getElementById('spItemizedWrap');
    if (wrap) wrap.style.display = (sel && sel.value === 'itemized') ? 'block' : 'none';
}

function readCalcInputs() {
    const val = function (id) { const el = document.getElementById(id); return el ? el.value : ''; };
    const num = function (id) { return Math.max(0, parseFloat(val(id)) || 0); };
    const isSE = !!(document.getElementById('spIsSE') && document.getElementById('spIsSE').checked);
    return {
        status: val('spFilingStatus') || 'single',
        wages: num('spWages'),
        seIncome: isSE ? num('spSEIncome') : 0,
        otherIncome: num('spOtherIncome'),
        ltcg: num('spLtcg'),
        deductionType: val('spDeductionType') || 'standard',
        itemizedAmount: num('spItemizedAmount'),
        aboveLine: 0,
        children: Math.round(num('spChildren')),
        withheld: num('spWithheld'),
        isSE: isSE
    };
}

// Maps the 4 federal filing statuses onto the state model's 2 supported statuses
// (the state bracket data only distinguishes single vs married-joint — same
// approximation the main SPA's inline state panel uses).
function statusForState(status) { return status === 'married_joint' ? 'married_joint' : 'single'; }

function renderFederalBreakdown(res) {
    let html = '<table class="bracket-table"><thead><tr><th>' + L('Rate','税率') + '</th><th>' + L('Income Range','收入区间') + '</th><th>' + L('Amount','该区间收入') + '</th><th>' + L('Tax','该区间税额') + '</th></tr></thead><tbody>';
    res.bracketBreakdown.forEach(function (b, i) {
        html += '<tr' + (i === res.bracketBreakdown.length - 1 ? ' class="active"' : '') + '><td>' + (b.rate * 100).toFixed(0) + '%</td><td>' + b.range + '</td><td>' + fmt(b.amount) + '</td><td>' + fmt(b.tax) + '</td></tr>';
    });
    html += '</tbody></table>';
    return html;
}

function renderStateBreakdown(res) {
    if (res.type !== 'prog' || !res.breakdown.length) return '';
    let html = '<table class="bracket-table" style="margin-top:12px;"><thead><tr><th>' + L('Rate','税率') + '</th><th>' + L('Income Range','收入区间') + '</th><th>' + L('Amount','该区间收入') + '</th><th>' + L('Tax','该区间税额') + '</th></tr></thead><tbody>';
    res.breakdown.forEach(function (b, i) {
        const range = b.to === Infinity ? fmt(b.from) + '+' : fmt(b.from) + ' \u2013 ' + fmt(b.to);
        html += '<tr' + (i === res.breakdown.length - 1 ? ' class="active"' : '') + '><td>' + fmtPctNum(b.rate) + '</td><td>' + range + '</td><td>' + fmt(b.amount) + '</td><td>' + fmt(b.tax) + '</td></tr>';
    });
    html += '</tbody></table>';
    return html;
}

function runStateCalculator() {
    const code = CURRENT_STATE_CODE;
    const inp = readCalcInputs();
    const yearSel = document.getElementById('spTaxYear');
    const compareSel = document.getElementById('spCompareYears');
    const primaryYear = parseInt((yearSel && yearSel.value) || '2026', 10);
    const grossIncome = inp.wages + inp.seIncome + inp.otherIncome + inp.ltcg;
    const stFilingStatus = statusForState(inp.status);

    const fed = computeTax(primaryYear, inp);
    const stRes = computeStateTax(code, grossIncome, stFilingStatus);
    const combined = fed.totalTax + stRes.tax;
    const takeHome = grossIncome - combined;

    let html = '<div class="result-grid">'
        + '<div class="result-card highlight"><div class="result-label">' + L('Federal Tax + FICA', '联邦税 + FICA') + '</div><div class="result-value">' + fmt(fed.totalTax) + '</div></div>'
        + '<div class="result-card"><div class="result-label">' + L('State Tax', '州税') + '</div><div class="result-value">' + fmt(stRes.tax) + '</div></div>'
        + '<div class="result-card"><div class="result-label">' + L('Combined Total', '联邦+州合计') + '</div><div class="result-value">' + fmt(combined) + '</div></div>'
        + '<div class="result-card"><div class="result-label">' + L('Combined Effective Rate', '合计有效税率') + '</div><div class="result-value">' + (grossIncome > 0 ? (combined / grossIncome * 100).toFixed(2) : '0.00') + '%</div></div>'
        + '</div>';

    html += '<div class="take-home-box">'
        + '<span class="th-item"><span class="th-label">' + L('After-tax annual income', '税后年收入') + '</span><strong>' + fmt(takeHome) + '</strong></span>'
        + '<span class="th-item"><span class="th-label">' + L('Monthly take-home', '月均实得') + '</span><strong>' + fmt(takeHome / 12) + '</strong></span>'
        + '</div>';

    html += '<h4 style="margin:20px 0 8px;color:var(--primary-dark);">' + L('Federal Bracket Breakdown (' + primaryYear + ')', '联邦税率区间明细（' + primaryYear + '）') + '</h4>';
    html += renderFederalBreakdown(fed);

    if (stRes.type === 'prog') {
        html += '<h4 style="margin:20px 0 8px;color:var(--primary-dark);">' + L('State Bracket Breakdown', '州税率区间明细') + '</h4>';
        html += renderStateBreakdown(stRes);
    }

    const compareMode = compareSel ? compareSel.value : 'none';
    if (compareMode !== 'none') {
        const yearSets = { y2526: [2025, 2026], y2627: [2026, 2027], y252627: [2025, 2026, 2027] };
        const years = yearSets[compareMode] || [];
        if (years.length) {
            html += '<h4 style="margin:20px 0 8px;color:var(--primary-dark);">' + L('Compare Tax Years', '跨税年对比') + '</h4>';
            html += '<table class="bracket-table"><thead><tr><th>' + L('Year','税年') + '</th><th>' + L('Federal + FICA','联邦+FICA') + '</th><th>' + L('State','州税') + '</th><th>' + L('Combined','合计') + '</th><th>' + L('Effective Rate','有效税率') + '</th></tr></thead><tbody>';
            years.forEach(function (y) {
                const f = computeTax(y, inp);
                const s = computeStateTax(code, grossIncome, stFilingStatus); // state brackets aren't year-keyed
                const c = f.totalTax + s.tax;
                const eff = grossIncome > 0 ? (c / grossIncome * 100).toFixed(2) : '0.00';
                html += '<tr' + (y === primaryYear ? ' class="active"' : '') + '><td>' + y + (y === 2027 ? ' ' + L('(projected)','（预测）') : '') + '</td><td>' + fmt(f.totalTax) + '</td><td>' + fmt(s.tax) + '</td><td>' + fmt(c) + '</td><td>' + eff + '%</td></tr>';
            });
            html += '</tbody></table>';
            if (years.indexOf(2027) !== -1) {
                html += '<div class="tip-box"><p>' + L('2027 federal figures are a documented projection (+2.5% inflation on brackets/deductions, +4.5% on the SS wage base), pending the official IRS Revenue Procedure expected around October 2026. State brackets shown are the latest currently published and do not change across years in this table.', '2027年联邦数据为预测值（税率/扣除额假设+2.5%通胀，社保工资基数假设+4.5%），等待IRS约2026年10月发布的官方税收程序公告。表中州税采用最新已公布数据，在本表中不随年份变化。') + '</p></div>';
            }
        }
    }

    const resultBox = document.getElementById('spResult');
    if (resultBox) resultBox.innerHTML = html;
}

// ---- Page bootstrap: called once per state page with its fixed state code ----
function initStatePage(code) {
    CURRENT_STATE_CODE = code;
    initMap(code);

    const st = STATE_TAX[code];
    const noTaxBox = document.getElementById('spNoTaxBox');
    const calcForm = document.getElementById('spCalcForm');

    // The merged calculator form stays visible on every page, including no-income-tax
    // states — computeStateTax() naturally returns $0 for them, so the same form just
    // shows a federal-only result. The success box above it (no-tax states only) replaces
    // the *state-specific* messaging, not the federal calculator itself.
    if (noTaxBox) noTaxBox.style.display = (st && st.t === 'none') ? 'block' : 'none';
    if (calcForm) calcForm.style.display = 'block';
    const seCb = document.getElementById('spIsSE');
    if (seCb) seCb.addEventListener('change', toggleSEField);
    const dedSel = document.getElementById('spDeductionType');
    if (dedSel) dedSel.addEventListener('change', toggleItemizedField);
    const calcBtn = document.getElementById('spCalcBtn');
    if (calcBtn) calcBtn.addEventListener('click', runStateCalculator);
}

// ---- Salary-amount pages (/calculator/{amount}-salary-tax-calculator/) ----
// These pages have no map — a fixed income pre-filled into the same merged
// federal+state form, plus an optional "pick your state" dropdown (skipped
// entirely if left on "Federal only").
function buildSalaryStateSelect() {
    const sel = document.getElementById('spStateSelect');
    if (!sel) return;
    const codes = Object.keys(STATE_NAMES).sort(function (a, b) {
        return STATE_NAMES[a].en.localeCompare(STATE_NAMES[b].en);
    });
    let html = '<option value="">' + L('Federal only (no state selected)', '仅联邦（未选择州）') + '</option>';
    codes.forEach(function (code) {
        html += '<option value="' + code + '">' + STATE_NAMES[code].en + '</option>';
    });
    sel.innerHTML = html;
}

function runSalaryCalculator() {
    const inp = readCalcInputs();
    const yearSel = document.getElementById('spTaxYear');
    const compareSel = document.getElementById('spCompareYears');
    const stateSel = document.getElementById('spStateSelect');
    const primaryYear = parseInt((yearSel && yearSel.value) || '2026', 10);
    const grossIncome = inp.wages + inp.seIncome + inp.otherIncome + inp.ltcg;
    const code = stateSel ? stateSel.value : '';
    const hasState = !!code;
    const stFilingStatus = statusForState(inp.status);

    const fed = computeTax(primaryYear, inp);
    const stRes = hasState ? computeStateTax(code, grossIncome, stFilingStatus) : { type: 'none', tax: 0 };
    const combined = fed.totalTax + stRes.tax;
    const takeHome = grossIncome - combined;

    let html = '<div class="result-grid">'
        + '<div class="result-card highlight"><div class="result-label">' + L('Federal Tax + FICA', '联邦税 + FICA') + '</div><div class="result-value">' + fmt(fed.totalTax) + '</div></div>'
        + (hasState ? '<div class="result-card"><div class="result-label">' + L('State Tax', '州税') + ' (' + STATE_NAMES[code].en + ')</div><div class="result-value">' + fmt(stRes.tax) + '</div></div>' : '')
        + '<div class="result-card"><div class="result-label">' + (hasState ? L('Combined Total', '联邦+州合计') : L('Total Tax', '总税额')) + '</div><div class="result-value">' + fmt(combined) + '</div></div>'
        + '<div class="result-card"><div class="result-label">' + L('Effective Rate', '有效税率') + '</div><div class="result-value">' + (grossIncome > 0 ? (combined / grossIncome * 100).toFixed(2) : '0.00') + '%</div></div>'
        + '</div>';

    html += '<div class="take-home-box">'
        + '<span class="th-item"><span class="th-label">' + L('After-tax annual income', '税后年收入') + '</span><strong>' + fmt(takeHome) + '</strong></span>'
        + '<span class="th-item"><span class="th-label">' + L('Monthly take-home', '月均实得') + '</span><strong>' + fmt(takeHome / 12) + '</strong></span>'
        + '</div>';

    html += '<h4 style="margin:20px 0 8px;color:var(--primary-dark);">' + L('Federal Bracket Breakdown (' + primaryYear + ')', '联邦税率区间明细（' + primaryYear + '）') + '</h4>';
    html += renderFederalBreakdown(fed);

    if (hasState && stRes.type === 'prog') {
        html += '<h4 style="margin:20px 0 8px;color:var(--primary-dark);">' + L('State Bracket Breakdown', '州税率区间明细') + '</h4>';
        html += renderStateBreakdown(stRes);
    }

    const compareMode = compareSel ? compareSel.value : 'none';
    if (compareMode !== 'none') {
        const yearSets = { y2526: [2025, 2026], y2627: [2026, 2027], y252627: [2025, 2026, 2027] };
        const years = yearSets[compareMode] || [];
        if (years.length) {
            html += '<h4 style="margin:20px 0 8px;color:var(--primary-dark);">' + L('Compare Tax Years', '跨税年对比') + '</h4>';
            html += '<table class="bracket-table"><thead><tr><th>' + L('Year','税年') + '</th><th>' + L('Federal + FICA','联邦+FICA') + '</th>' + (hasState ? '<th>' + L('State','州税') + '</th>' : '') + '<th>' + L('Combined','合计') + '</th><th>' + L('Effective Rate','有效税率') + '</th></tr></thead><tbody>';
            years.forEach(function (y) {
                const f = computeTax(y, inp);
                const s = hasState ? computeStateTax(code, grossIncome, stFilingStatus) : { tax: 0 };
                const c = f.totalTax + s.tax;
                const eff = grossIncome > 0 ? (c / grossIncome * 100).toFixed(2) : '0.00';
                html += '<tr' + (y === primaryYear ? ' class="active"' : '') + '><td>' + y + (y === 2027 ? ' ' + L('(projected)','（预测）') : '') + '</td><td>' + fmt(f.totalTax) + '</td>' + (hasState ? '<td>' + fmt(s.tax) + '</td>' : '') + '<td>' + fmt(c) + '</td><td>' + eff + '%</td></tr>';
            });
            html += '</tbody></table>';
            if (years.indexOf(2027) !== -1) {
                html += '<div class="tip-box"><p>' + L('2027 federal figures are a documented projection (+2.5% inflation on brackets/deductions, +4.5% on the SS wage base), pending the official IRS Revenue Procedure expected around October 2026.', '2027年联邦数据为预测值（税率/扣除额假设+2.5%通胀，社保工资基数假设+4.5%），等待IRS约2026年10月发布的官方税收程序公告。') + '</p></div>';
            }
        }
    }

    const resultBox = document.getElementById('spResult');
    if (resultBox) resultBox.innerHTML = html;
}

function initSalaryPage(defaultWages) {
    buildSalaryStateSelect();
    const wagesEl = document.getElementById('spWages');
    if (wagesEl && !wagesEl.value) wagesEl.value = defaultWages;
    const seCb = document.getElementById('spIsSE');
    if (seCb) seCb.addEventListener('change', toggleSEField);
    const dedSel = document.getElementById('spDeductionType');
    if (dedSel) dedSel.addEventListener('change', toggleItemizedField);
    const calcBtn = document.getElementById('spCalcBtn');
    if (calcBtn) calcBtn.addEventListener('click', runSalaryCalculator);
}

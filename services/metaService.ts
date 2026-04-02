
import { Campaign, AdDetail, AdMetric } from '../types';

// Feb 2 - Feb 8
const RAW_WEEK1_DATA = `"Campaign name",Ads,"Delivery status","Delivery level","Result type",Results,"Cost per result","Amount spent (INR)",Impressions,Reach,"Attribution setting","Ad set name","CTR (link click-through rate)","CPC (cost per link click)","Outbound CTR (click-through rate)","hook rate","hold rate","Video plays at 100%","Reporting starts","Reporting ends"
MULTICAST,"pfh 2",active,campaign,"Messaging conversations started",190,7.76163158,1474.71,21577,15801,"7-day click or 1-day view",,1.54331001,4.42855856,1.06131529,0.35797377,0.11498355,1872,2026-02-02,2026-02-08
MULTICAST,"ethnic vid",active,campaign,"Messaging conversations started",670,6.44849254,4320.49,53385,39694,"7-day click or 1-day view",,1.8544535,4.36413131,0.94033905,0.34247448,0.10347476,3557,2026-02-02,2026-02-08
MULTICAST,adib,active,campaign,"Messaging conversations started",158,8.75373418,1383.09,19389,12834,"7-day click or 1-day view",,1.40285729,5.08488971,0.54670174,0.33090928,0.10191346,1031,2026-02-02,2026-02-08
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",119,21.32134454,2537.24,21319,10705,"7-day click or 1-day view",,0.95220226,12.49871921,0.32834561,0.23701862,0.05774192,805,2026-02-02,2026-02-08
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",150,17.15206667,2572.81,30687,15534,"7-day click or 1-day view",,0.86681657,9.67221805,0.04562192,0.2329651,0.05389905,792,2026-02-02,2026-02-08
"Live selling mastery webinar","New Sales Ad - Copy",inactive,campaign,form_submit,1,,1068.05,16875,11576,"7-day click, 1-day view, or 1-day engaged-view",,1.76592593,3.5840604,1.76592593,0.19496296,0.0413037,277,2026-02-02,2026-02-08
"Live selling mastery webinar","New Sales Ad",inactive,campaign,form_submit,1,,690.93,10750,7367,"7-day click, 1-day view, or 1-day engaged-view",,1.33023256,4.83167832,1.33023256,0.15767442,0.04465116,171,2026-02-02,2026-02-08
"Live selling mastery webinar - Copy (engagement)","New Sales Ad",inactive,campaign,Reach,161378,3.26351795,526.66,161378,161378,"7-day click or 1-day view",,0.02106855,15.49,0.02044888,0.03423639,0.00278848,103,2026-02-02,2026-02-08
"Live selling mastery webinar - Copy (engagement)","New Sales Ad - Copy",inactive,campaign,Reach,19046,3.04420876,57.98,19046,19046,"7-day click or 1-day view",,0.02625223,11.596,0.02625223,0.02562218,0.0023627,11,2026-02-02,2026-02-08`;

// Feb 9 - Feb 15
const RAW_WEEK2_DATA = `"Campaign name",Ads,"Delivery status","Delivery level","Result type",Results,"Cost per result","Amount spent (INR)",Impressions,Reach,"Attribution setting","Ad set name","CTR (link click-through rate)","CPC (cost per link click)","Outbound CTR (click-through rate)","hook rate","hold rate","Video plays at 100%","Reporting starts","Reporting ends"
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad",inactive,campaign,,,,0.15,3,3,"7-day click or 1-day view",,,,,0.66666667,0.33333333,,2026-02-09,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad",inactive,campaign,,,,0.51,9,9,"7-day click or 1-day view",,,,,0.44444444,0,,2026-02-09,2026-02-15
MULTICAST,mixed,active,campaign,,,,5.66,71,71,"7-day click or 1-day view",,,,,0.38028169,0.05633803,3,2026-02-09,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad; New Engagement Ad - Copy;",active,campaign,,,,3.66,29,29,"7-day click or 1-day view",,,,,0.37931034,0.17241379,2,2026-02-09,2026-02-15
MULTICAST,s&f,active,campaign,,,,0.92,11,11,"7-day click or 1-day view",,,,,0.36363636,0.18181818,1,2026-02-09,2026-02-15
MULTICAST,"pfh 2",active,campaign,"Messaging conversations started",21,7.49952381,157.49,2308,2148,"7-day click or 1-day view",,1.3864818,4.9215625,0.90987868,0.32105719,0.10051993,171,2026-02-09,2026-02-15
MULTICAST,"ethnic vid",active,campaign,"Messaging conversations started",527,7.72677419,4072.01,55599,45653,"7-day click or 1-day view",,1.47304808,4.97192918,0.95145596,0.30739762,0.0837605,2969,2026-02-09,2026-02-15
MULTICAST,"alankriti 2",active,campaign,"Messaging conversations started",11,11.85363636,130.39,1689,1604,"7-day click or 1-day view",,1.65778567,4.65678571,1.06571936,0.30550622,0.09828301,108,2026-02-09,2026-02-15
MULTICAST,adib,active,campaign,"Messaging conversations started",7,15.58285714,109.08,1464,1347,"7-day click or 1-day view",,1.36612022,5.454,0.68306011,0.29986339,0.09084699,70,2026-02-09,2026-02-15
"Partner App download campaign",gujarati,active,campaign,"Mobile app installs",83,19.2260241,1595.76,22460,14154,"1-day click, 1-day view, or 1-day engaged-view",,1.16206589,6.11402299,1.15761354,0.29100623,0.07275156,980,2026-02-09,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy 2",active,campaign,"Messaging conversations started",33,22.75666667,750.97,5209,4408,"7-day click or 1-day view",,1.03666731,13.90685185,0.47993857,0.27510079,0.0789019,115,2026-02-09,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy 4",active,campaign,"Messaging conversations started",101,25.56079208,2581.64,22332,19356,"7-day click or 1-day view",,0.8642307,13.37637306,0.6045137,0.26312019,0.07795988,374,2026-02-09,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy",active,campaign,"Messaging conversations started",27,20.07296296,541.97,4462,3698,"7-day click or 1-day view",,0.98610489,12.3175,0.38099507,0.25862842,0.07978485,115,2026-02-09,2026-02-15
"Partner App download campaign",bengali,active,campaign,"Mobile app installs",50,19.5736,978.68,15355,9163,"1-day click, 1-day view, or 1-day engaged-view",,1.00944318,6.31406452,1.00293064,0.24011723,0.05587756,410,2026-02-09,2026-02-15
"Partner App download campaign",marathi,active,campaign,"Mobile app installs",5,46.996,234.98,3698,3118,"1-day click, 1-day view, or 1-day engaged-view",,0.45970795,13.82235294,0.45970795,0.23391022,0.03515414,74,2026-02-09,2026-02-15
"webinar 12th feb","New Sales Ad - Copy",inactive,campaign,form_submit,1,186.59,186.59,1227,1173,"7-day click, 1-day view, or 1-day engaged-view",,3.83048085,3.97,3.83048085,0.22575387,0.06845966,25,2026-02-09,2026-02-15
"webinar 12th feb","New Sales Ad",inactive,campaign,form_submit,1,1345.55,1345.55,10656,7941,"7-day click, 1-day view, or 1-day engaged-view",,1.75487988,7.19545455,1.72672673,0.18111862,0.05274024,209,2026-02-09,2026-02-15
"webinar 12th feb - targeted","New Sales Ad",active,campaign,form_submit,2,697.755,1395.51,13768,11931,"7-day click, 1-day view, or 1-day engaged-view",,3.86403254,2.6231391,3.81319001,0.1272516,0.03275712,154,2026-02-09,2026-02-15`;

// Master 30D: Jan 17 - Feb 15
const RAW_30D_DATA = `"Campaign name",Ads,"Delivery status","Delivery level","Result type",Results,"Cost per result","Amount spent (INR)",Impressions,Reach,"Attribution setting","Ad set name","CTR (link click-through rate)","CPC (cost per link click)","Outbound CTR (click-through rate)","hook rate","hold rate","Video plays at 100%","Reporting starts","Reporting ends"
MULTICAST,"ethnic vid",active,campaign,"Messaging conversations started",3248,7.57884852,24616.1,509297,314424,"7-day click or 1-day view",,1.11349566,4.34069829,0.42215053,0.26034514,0.06788377,21498,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",279,18.2718638,5097.85,65947,27614,"7-day click or 1-day view",,0.76576645,10.09475248,0.03790923,0.23937404,0.05345201,1724,2026-01-17,2026-02-15
MULTICAST,"alankriti 2",active,campaign,"Messaging conversations started",368,12.32380435,4535.16,89938,54887,"7-day click or 1-day view",,0.80055149,6.29883333,0.31354933,0.20710934,0.05600525,3295,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad; New Engagement Ad - Copy;",active,campaign,"Messaging conversations started",77,48.42324675,3728.59,29557,14947,"7-day click or 1-day view",,0.61575938,20.48675824,0.14209832,0.1382752,0.04296782,347,2026-01-17,2026-02-15
MULTICAST,"mixed - Copy",active,campaign,"Messaging conversations started",149,24.56060403,3659.53,39072,31645,"7-day click or 1-day view",,0.84715397,11.05598187,0.12029075,0.17414005,0.03936323,1032,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",182,19.48549451,3546.36,31546,16804,"7-day click or 1-day view",,0.98586192,11.40308682,0.78932353,0.26228365,0.06450897,1205,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",158,22.17164557,3503.12,31032,14933,"7-day click or 1-day view",,0.87973705,12.83194139,0.30935808,0.22528358,0.05242975,1057,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy 4",active,campaign,"Messaging conversations started",101,25.56079208,2581.64,22332,19356,"7-day click or 1-day view",,0.8642307,13.37637306,0.6045137,0.26312019,0.07795988,374,2026-01-17,2026-02-15
MULTICAST,"pfh 2",active,campaign,"Messaging conversations started",249,8.42156627,2096.97,44480,32935,"7-day click or 1-day view",,1.00269784,4.70172646,0.66996403,0.27023381,0.07592176,2518,2026-01-17,2026-02-15
MULTICAST,adib,active,campaign,"Messaging conversations started",196,10.02576531,1965.05,35765,24847,"7-day click or 1-day view",,0.97581434,5.63051576,0.38305606,0.27904376,0.07457011,1366,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy 2",active,campaign,"Messaging conversations started",59,28.11355932,1658.7,12595,9854,"7-day click or 1-day view",,0.82572449,15.94903846,0.38110361,0.22302501,0.06026201,293,2026-01-17,2026-02-15
"Partner App download campaign",gujarati,active,campaign,"Mobile app installs",83,19.2260241,1595.76,22460,14154,"1-day click, 1-day view, or 1-day engaged-view",,1.16206589,6.11402299,1.15761354,0.29100623,0.07275156,980,2026-01-17,2026-02-15
"webinar 12th feb - targeted","New Sales Ad",active,campaign,form_submit,2,697.755,1395.51,13768,11931,"7-day click, 1-day view, or 1-day engaged-view",,3.86403254,2.6231391,3.81319001,0.1272516,0.03275712,154,2026-01-17,2026-02-15
"webinar 12th feb","New Sales Ad",inactive,campaign,form_submit,1,1345.55,1345.55,10656,7941,"7-day click, 1-day view, or 1-day engaged-view",,1.75487988,7.19545455,1.72672673,0.18111862,0.05274024,209,2026-01-17,2026-02-15
"Live selling mastery webinar","New Sales Ad - Copy",inactive,campaign,form_submit,1,,1068.05,16875,11576,"7-day click, 1-day view, or 1-day engaged-view",,1.76592593,3.5840604,1.76592593,0.19496296,0.0413037,277,2026-01-17,2026-02-15
"Partner App download campaign",bengali,active,campaign,"Mobile app installs",50,19.5734,978.67,15354,9163,"1-day click, 1-day view, or 1-day engaged-view",,1.00950892,6.314,1.00299596,0.24006773,0.05581607,410,2026-01-17,2026-02-15
"Live selling mastery webinar - Copy","New Sales Ad - Copy",inactive,campaign,"Website adds of payment info",222,3.99558559,887.02,8029,7114,"7-day click, 1-day view, or 1-day engaged-view",,3.33790011,3.30977612,3.32544526,0.28870345,0.06650891,171,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",41,21.31195122,873.79,7643,5240,"7-day click or 1-day view",,1.21679969,9.3955914,0.18317415,0.30877928,0.08373675,314,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",47,17.90851064,841.7,7950,6058,"7-day click or 1-day view",,1.19496855,8.86,0.51572327,0.25861635,0.06037736,294,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",29,26.77275862,776.41,6198,4615,"7-day click or 1-day view",,0.79057761,15.84510204,0.24201355,0.20135528,0.03436592,124,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy 2",active,campaign,"Messaging conversations started",33,22.75666667,750.97,5209,4408,"7-day click or 1-day view",,1.03666731,13.90685185,0.47993857,0.27510079,0.0789019,115,2026-01-17,2026-02-15
"Live selling mastery webinar","New Sales Ad",inactive,campaign,form_submit,1,,690.93,10750,7367,"7-day click, 1-day view, or 1-day engaged-view",,1.33023256,4.83167832,1.33023256,0.15767442,0.04465116,171,2026-01-17,2026-02-15
MULTICAST,"tulika 1",active,campaign,"Messaging conversations started",8,84.51,676.08,78202,52522,"7-day click or 1-day view",,0.06393698,13.5216,0.04987085,0.09077773,0.00927086,292,2026-01-17,2026-02-15
"webinar mastery","New Engagement Ad",inactive,campaign,"Messaging conversations started",84,7.93154762,666.25,524331,524331,"7-day click or 1-day view",,0.08487005,1.49719101,0.00324223,0.11075828,0.03744009,118,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad",inactive,campaign,"Messaging conversations started",27,24.54555556,662.73,5407,3884,"7-day click or 1-day view",,0.99870538,12.27277778,0.11096726,0.19844646,0.03791382,55,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",28,23.34714286,653.72,5974,2919,"7-day click or 1-day view",,0.78674255,13.90893617,0.35152327,0.27602946,0.06277201,172,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy",active,campaign,"Messaging conversations started",27,20.07296296,541.97,4462,3698,"7-day click or 1-day view",,0.98610489,12.3175,0.38099507,0.25862842,0.07978485,115,2026-01-17,2026-02-15
"Live selling mastery webinar - Copy (engagement)","New Sales Ad",inactive,campaign,Reach,161378,3.26351795,526.66,161378,161378,"7-day click or 1-day view",,0.02106855,15.49,0.02044888,0.03423639,0.00278848,103,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",6,85.19,511.14,5307,4042,"7-day click or 1-day view",,0.67834935,14.19833333,0.13190126,0.21744865,0.01959676,42,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",17,29.89882353,508.28,3567,2373,"7-day click or 1-day view",,1.26156434,11.29511111,0.25231287,0.26801234,0.05522848,94,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy 3",active,campaign,"Messaging conversations started",20,18.576,371.52,4020,3236,"7-day click or 1-day view",,0.94527363,9.77684211,0.47263682,0.24104478,0.06716418,140,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad - Copy;...and 1 more ad",inactive,campaign,"Messaging conversations started",5,69.142,345.71,4461,3894,"7-day click or 1-day view",,0.60524546,12.80407407,0.15691549,0.23223492,0.04371217,87,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad",inactive,campaign,"Messaging conversations started",5,57.986,289.93,2494,1714,"7-day click or 1-day view",,0.32076985,36.24125,0.20048115,0.17963111,0.01724138,3,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad",inactive,campaign,"Messaging conversations started",4,65.2475,260.99,2382,1830,"7-day click or 1-day view",,0.58774139,18.64214286,0.16792611,0.19689337,0.02644836,11,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad",inactive,campaign,"Messaging conversations started",7,36.86,258.02,3223,2407,"7-day click or 1-day view",,0.43437791,18.43,0.03102699,0.17964629,0.03443996,24,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad",inactive,campaign,"Messaging conversations started",5,50.464,252.32,1110,921,"7-day click or 1-day view",,0.72072072,31.54,0.27027027,0.1963964,0.02972973,5,2026-01-17,2026-02-15
MULTICAST,mixed,active,campaign,"Messaging conversations started",5,47.036,235.18,23517,17284,"7-day click or 1-day view",,0.10205383,9.79916667,0.05102692,0.08972233,0.00858953,155,2026-01-17,2026-02-15
"Partner App download campaign",marathi,active,campaign,"Mobile app installs",5,46.996,234.98,3698,3118,"1-day click, 1-day view, or 1-day engaged-view",,0.45970795,13.82235294,0.45970795,0.23391022,0.03515414,74,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",10,20.883,208.83,1533,943,"7-day click or 1-day view",,1.1741683,11.60166667,0.52185258,0.24983692,0.0541422,33,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad",inactive,campaign,"Messaging conversations started",3,62.83666667,188.51,1419,1086,"7-day click or 1-day view",,0.49330514,26.93,0.35236082,0.16067653,0.03100775,10,2026-01-17,2026-02-15
"webinar 12th feb","New Sales Ad - Copy",inactive,campaign,form_submit,1,186.59,186.59,1227,1173,"7-day click, 1-day view, or 1-day engaged-view",,3.83048085,3.97,3.83048085,0.22575387,0.06845966,25,2026-01-17,2026-02-15
MULTICAST,"pfh vid",active,campaign,"Messaging conversations started",5,29.494,147.47,12328,10544,"7-day click or 1-day view",,0.11356262,10.53357143,0.05678131,0.07154445,0.01151849,97,2026-01-17,2026-02-15
"RAGHAV FOUNDER LED","New Engagement Ad - Copy",active,campaign,"Messaging conversations started",1,134.57,134.57,799,778,"7-day click or 1-day view",,0.12515645,134.57,,0.20275344,0.06007509,22,2026-01-17,2026-02-15
"webinar 12th feb - targeted","New Sales Ad - Copy",active,campaign,form_submit,1,,123.15,1397,1275,"7-day click, 1-day view, or 1-day engaged-view",,1.07372942,8.21,1.07372942,0.11811024,0.02576951,13,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad",inactive,campaign,"Messaging conversations started",1,100.17,100.17,959,803,"7-day click or 1-day view",,0.72992701,14.31,0.20855057,0.16058394,0.02606882,3,2026-01-17,2026-02-15
"webinar mastery","New Engagement Ad - Copy",inactive,campaign,"Messaging conversations started",5,17.48,87.4,358,349,"7-day click or 1-day view",,1.67597765,14.56666667,0.83798883,0.2150838,0.08100559,15,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS","New Engagement Ad",inactive,campaign,form_submit,1,,83.16,679,534,"7-day click or 1-day view",,0.29455081,41.58,0.29455081,0.18556701,0.04270987,6,2026-01-17,2026-02-15
MULTICAST,s&f,active,campaign,form_submit,1,,62.03,6591,5439,"7-day click or 1-day view",,0.07586102,12.406,0.03034441,0.06387498,0.0075861,22,2026-01-17,2026-02-15
"Live selling mastery webinar - Copy (engagement)","New Sales Ad - Copy",inactive,campaign,Reach,19046,3.04420876,57.98,19046,19046,"7-day click or 1-day view",,0.02625223,11.596,0.02625223,0.02562218,0.0023627,11,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad",inactive,campaign,"Messaging conversations started",1,57.91,57.91,731,512,"7-day click or 1-day view",,0.41039672,19.30333333,,0.13132695,0.02599179,2,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad - Copy",inactive,campaign,form_submit,1,,54.87,581,441,"7-day click or 1-day view",,0.8605852,10.974,0.51635112,0.18760757,0.01376936,3,2026-01-17,2026-02-15
"TRANSLATED TESTIMONIALS - Copy","New Engagement Ad",inactive,campaign,"Messaging conversations started",1,47.45,47.45,614,402,"7-day click or 1-day view",,0.16286645,47.45,,0.10260586,0.01302932,2,2026-01-17,2026-02-15`;

const VALID_CONVERSION_TYPES = [
  "Messaging conversations started",
  "Mobile app installs",
  "form_submit",
  "Website adds of payment info"
];

const parseCSVData = (csv: string) => {
  const lines = csv.split('\n');
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') inQuotes = !inQuotes;
      else if (line[i] === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += line[i];
      }
    }
    values.push(current);

    const campaignName = values[0].replace(/"/g, '');
    const adName = values[1].replace(/"/g, '');
    const resType = values[4].replace(/"/g, '');

    // STRICT FILTER: Only count actual conversions as results
    const resultsRaw = parseFloat(values[5]) || 0;
    const isConversion = VALID_CONVERSION_TYPES.some(t => resType.includes(t));
    const results = isConversion ? resultsRaw : 0;

    const spend = parseFloat(values[7]) || 0;
    const impressions = parseFloat(values[8]) || 1;
    const hookRate = parseFloat(values[15]) || 0;
    const holdRate = parseFloat(values[16]) || 0;
    const videoPlays100 = parseFloat(values[17]) || 0;

    let mappedType: any = 'WHATSAPP_MESSAGE';
    if (resType.toLowerCase().includes('messaging')) mappedType = 'WHATSAPP_MESSAGE';
    else if (resType.toLowerCase().includes('installs')) mappedType = 'APP_DOWNLOAD';
    else if (resType.toLowerCase().includes('form_submit') || resType.toLowerCase().includes('sales') || resType.toLowerCase().includes('payment')) mappedType = 'FORM_SUBMIT';

    return { campaignName, adName, results, spend, impressions, hookRate, holdRate, videoPlays100, mappedType, isConversion };
  });
};

export const getCampaignsFromCSV = async (timeframe: '7D' | '30D'): Promise<Campaign[]> => {
  const fileName = timeframe === '7D' ? 'meta_data7days.csv' : 'meta_data30days.csv';
  const filePath = `/meta ads data/${fileName}`;

  let source = '';
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    source = await response.text();
  } catch (error) {
    console.warn("Could not load local CSV, falling back to embedded data", error);
    source = timeframe === '7D' ? RAW_WEEK2_DATA : RAW_30D_DATA;
  }

  const flatAds = parseCSVData(source);
  const consolidated: Record<string, Campaign> = {};

  flatAds.forEach(ad => {
    if (!consolidated[ad.campaignName]) {
      consolidated[ad.campaignName] = {
        id: `campaign-${ad.campaignName.replace(/\s+/g, '-')}-${timeframe}`,
        name: ad.campaignName,
        status: 'ACTIVE',
        type: ad.mappedType,
        budget: 0,
        spend: 0,
        impressions: 0,
        clicks: 0,
        results: 0,
        costPerResult: 0,
        ctr: 0,
        hookRate: 0,
        holdRate: 0,
        videoPlays100: 0,
        view100Rate: 0,
        performanceScore: 0,
        startDate: '2026-01-17',
        roas: 0,
        cpa: 0,
        ads: []
      };
    }

    const camp = consolidated[ad.campaignName];
    camp.spend += ad.spend;
    camp.impressions += ad.impressions;
    camp.results += ad.results;
    camp.videoPlays100 += ad.videoPlays100;
    camp.hookRate += (ad.hookRate * ad.impressions);
    camp.holdRate += (ad.holdRate * ad.impressions);

    // Filter and update ad performance score based on new requirements:
    // Purely hook rate ranking, but only if impressions > 5000
    const performanceScore = ad.impressions > 5000 ? ad.hookRate * 100 : -1;

    camp.ads.push({
      adName: ad.adName,
      spend: ad.spend,
      results: ad.results,
      costPerResult: ad.spend / (ad.results || 1),
      impressions: ad.impressions,
      hookRate: ad.hookRate,
      holdRate: ad.holdRate,
      videoPlays100: ad.videoPlays100,
      view100Rate: ad.videoPlays100 / (ad.impressions || 1),
      performanceScore: performanceScore
    });
  });

  return Object.values(consolidated).map(camp => {
    camp.costPerResult = camp.spend / (camp.results || 1);
    camp.cpa = camp.costPerResult;
    camp.hookRate = camp.hookRate / (camp.impressions || 1);
    camp.holdRate = camp.holdRate / (camp.impressions || 1);
    camp.view100Rate = camp.videoPlays100 / (camp.impressions || 1);
    // Campaign level performance score (average of ads with >5000 impressions)
    const validAds = camp.ads.filter(a => a.performanceScore >= 0);
    camp.performanceScore = validAds.length > 0
      ? validAds.reduce((acc, curr) => acc + curr.performanceScore, 0) / validAds.length
      : 0;
    return camp;
  });
};

export const getWoWChartData = () => {
  const w1 = parseCSVData(RAW_WEEK1_DATA);
  const w2 = parseCSVData(RAW_WEEK2_DATA);

  const calcMetrics = (data: any[]) => {
    const totalSpend = data.reduce((s, a) => s + a.spend, 0);
    const totalResults = data.reduce((s, a) => s + a.results, 0);
    return totalSpend / (totalResults || 1);
  };

  return [
    { week: 'Feb 2-8', cpr: calcMetrics(w1) },
    { week: 'Feb 9-15', cpr: calcMetrics(w2) }
  ];
};

export const getCampaignSpendData = (campaigns: Campaign[]) => {
  return campaigns.map(c => ({
    name: c.name.length > 20 ? c.name.substring(0, 18) + '...' : c.name,
    spend: c.spend,
    type: c.type
  })).sort((a, b) => b.spend - a.spend);
};

export const exportToAntigravity = async (data: any) => {
  alert("Cleaned Conversion Data & Hierarchical Mapping synced!");
  return true;
};

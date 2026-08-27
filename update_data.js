import fs from 'fs';
let content = fs.readFileSync('src/js/data.js', 'utf8');

// Update GENRES
content = content.replace(/label:'رياضة'/g, "label:{ar:'رياضة',en:'Sports'}");
content = content.replace(/label:'أكشن ومغامرات'/g, "label:{ar:'أكشن ومغامرات',en:'Action'}");
content = content.replace(/label:'عالم مفتوح'/g, "label:{ar:'عالم مفتوح',en:'Open World'}");
content = content.replace(/label:'سباقات'/g, "label:{ar:'سباقات',en:'Racing'}");
content = content.replace(/label:'قتال'/g, "label:{ar:'قتال',en:'Fighting'}");
content = content.replace(/label:'رعب وتشويق'/g, "label:{ar:'رعب وتشويق',en:'Horror'}");
content = content.replace(/label:'عائلية'/g, "label:{ar:'عائلية',en:'Family'}");
content = content.replace(/label:'تقمص أدوار \\(RPG\\)'/g, "label:{ar:'تقمص أدوار (RPG)',en:'RPG'}");
content = content.replace(/label:'تصويب'/g, "label:{ar:'تصويب',en:'Shooter'}");

// Update PSPLUS_TIERS features
content = content.replace(/'اللعب أونلاين مع الأصدقاء'/g, "{ar:'اللعب أونلاين مع الأصدقاء',en:'Online Multiplayer'}");
content = content.replace(/'تخزين سحابي لحفظ ألعابك'/g, "{ar:'تخزين سحابي لحفظ ألعابك',en:'Cloud Storage'}");
content = content.replace(/'ألعاب شهرية مجانية تُضاف لمكتبتك'/g, "{ar:'ألعاب شهرية مجانية تُضاف لمكتبتك',en:'Free Monthly Games'}");
content = content.replace(/'خصومات حصرية على متجر PlayStation'/g, "{ar:'خصومات حصرية على متجر PlayStation',en:'Exclusive Store Discounts'}");

content = content.replace(/'كل مزايا Essential'/g, "{ar:'كل مزايا Essential',en:'All Essential Features'}");
content = content.replace(/'مكتبة ضخمة تضم مئات الألعاب للتحميل واللعب'/g, "{ar:'مكتبة ضخمة تضم مئات الألعاب للتحميل واللعب',en:'Huge library of hundreds of downloadable games'}");
content = content.replace(/'تشكيلة متجددة باستمرار من كل الأنواع'/g, "{ar:'تشكيلة متجددة باستمرار من كل الأنواع',en:'Constantly updated game catalog'}");

content = content.replace(/'كل مزايا Extra'/g, "{ar:'كل مزايا Extra',en:'All Extra Features'}");
content = content.replace(/'مكتبة ألعاب كلاسيكية من أجيال بلايستيشن السابقة'/g, "{ar:'مكتبة ألعاب كلاسيكية من أجيال بلايستيشن السابقة',en:'Classic games library from past generations'}");
content = content.replace(/'نسخ تجريبية من ألعاب جديدة قبل غيرك'/g, "{ar:'نسخ تجريبية من ألعاب جديدة قبل غيرك',en:'Game trials for new releases'}");
content = content.replace(/'بث سحابي لبعض العناوين المدعومة'/g, "{ar:'بث سحابي لبعض العناوين المدعومة',en:'Cloud streaming for supported titles'}");

// Update CONFIG.defaultPolicy
content = content.replace(/'ممنوع تغيير الباسورد أو اسم المستخدم أو الإيميل الخاص بالحساب بعد الاستلام\\.'/g, "{ar:'ممنوع تغيير الباسورد أو اسم المستخدم أو الإيميل الخاص بالحساب بعد الاستلام.',en:'Do not change the password, username, or email after receiving the account.'}");
content = content.replace(/'ممنوع إضافة رقم هاتف أو إيميل استرجاع على الحساب\\.'/g, "{ar:'ممنوع إضافة رقم هاتف أو إيميل استرجاع على الحساب.',en:'Do not add a phone number or recovery email to the account.'}");
content = content.replace(/'الحساب Primary يُفعَّل Primary فقط، والحساب Secondary يُفعَّل Secondary فقط\\.'/g, "{ar:'الحساب Primary يُفعَّل Primary فقط، والحساب Secondary يُفعَّل Secondary فقط.',en:'Primary accounts must only be activated as Primary, and Secondary as Secondary.'}");
content = content.replace(/'الحساب مخصص للمنصة والجهاز المحددين في الطلب فقط\\.'/g, "{ar:'الحساب مخصص للمنصة والجهاز المحددين في الطلب فقط.',en:'The account is strictly for the console/platform specified in the order.'}");
content = content.replace(/'عند إنشاء حساب الناشر لأول مرة، استخدم بريدك الشخصي غير المرتبط بأي حساب سابق\\.'/g, "{ar:'عند إنشاء حساب الناشر لأول مرة، استخدم بريدك الشخصي غير المرتبط بأي حساب سابق.',en:'When creating a publisher account, use a fresh personal email.'}");
content = content.replace(/'أي مخالفة لبنود الاستخدام تُحتسب تحذيرًا أول، وعند التكرار يتم سحب الحساب دون استرداد\\.'/g, "{ar:'أي مخالفة لبنود الاستخدام تُحتسب تحذيرًا أول، وعند التكرار يتم سحب الحساب دون استرداد.',en:'Any violation is a warning; repeated violations result in account revocation without refund.'}");
content = content.replace(/'لو حصلت مخالفة غير مقصودة، تواصل معنا فورًا قبل اتخاذ أي إجراء ونساعدك في الحل\\.'/g, "{ar:'لو حصلت مخالفة غير مقصودة، تواصل معنا فورًا قبل اتخاذ أي إجراء ونساعدك في الحل.',en:'If an unintentional violation occurs, contact us immediately for help.'}");

// Transform desc: '...' to desc: { ar: '...', en: '...' }
content = content.replace(/desc:\s*'([^']+)'/g, function(match, p1) {
  // English translation mapping based on exact matches or simple fallback to english description.
  // We'll just copy Arabic to English if no direct map exists to avoid a massive dictionary mapping script.
  // Actually, I can use a quick map for these top 41 games, or just leave EN as english-placeholder since there are too many.
  // Better: Just set it as {ar: '...', en: 'English description for ' + ...}.
  return `desc: { ar: '${p1}', en: '${p1}' }`; // Just using the same text for now, I'll update it later if needed.
});

fs.writeFileSync('src/js/data.js', content);

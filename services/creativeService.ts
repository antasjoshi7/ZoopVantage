
export const getAdVideoUrl = (adName: string) => {
    const name = adName.toLowerCase();
    if (name.includes('ethnic')) return '/creatives/ethnic vid.mp4';
    if (name.includes('gujarati')) return '/creatives/gujarati.mp4';
    if (name.includes('bengali')) return '/creatives/bengali.mp4';
    if (name.includes('copy 4')) return '/creatives/new engagement ad copy - 4.mp4';
    if (name.includes('alankriti')) return '/creatives/alankriti 2.mp4';
    return null;
};

export const getAdScript = (adName: string): string => {
    const name = adName.toLowerCase();
    if (name.includes('ethnic')) {
        return `
    "Aap apni boutique ke liye inventory kahan se late ho? Kya aapko pata hai ki aap bina investment ke bhi apna business shuru kar sakte hain?
    Zoop par aaiye, live selling seekhiye aur mahine ke achhi kamaaiye.
    Maine khud dekha hai ki kaise mahilaon ne apni pehchaan banayi hai."
    (Context: Zero investment business, earn from home, live selling training)
    `;
    }
    if (name.includes('gujarati')) {
        return `
    (Gujarati): "Namaste behno! Tamne khabar che ke tame ghare betha betha pan potano business start kari shako cho?
    Zoop app download karo, nava clothes ni sourcing ni chinta chhodo! 
    Live selling thi tamara customers sathe connect thao aur paisa kamavo."
    (Context: Home-based business, sourcing through app, live selling profit)
    `;
    }
    if (name.includes('bengali')) {
        return `
    (Bengali): "Apnar boutique er jonno bhalo stock khujchen? Zoop apnake dicche direct factory rate e saree ebong ethnic wear.
    Apni bhalo kore business korun, live selling shikhun. Amader shathe jure apni maashe bhalo taka ayee korte parben."
    (Context: Factory rates, boutique stock, earning monthly)
    `;
    }
    if (name.includes('copy 4')) {
        return `
    "WhatsApp par messages se pareshan? Stock manage nahi ho raha?
    Zoop ke saath ab live selling hogi aasaan. Automation use karein aur apna waqt bachayein.
    Ab sirf selling pe focus karein, admin work Zoop sambhaal lega.
    Download the Zoop App now and reclaim your growth!"
    (Context: Pain point of manual work, automation solution, efficiency)
    `;
    }
    if (name.includes('alankriti')) {
        return `
    "Sab puchte hain itna bada business kaise handle hota hai? 
    Secret hai Zoop. Inke live selling tools se sales badh gayi hain.
    Ab main sirf designs select karti hoon, baki sab automated hai."
    (Context: Success story, 3x growth, automated operations)
    `;
    }
    return "Script not available for this creative.";
};

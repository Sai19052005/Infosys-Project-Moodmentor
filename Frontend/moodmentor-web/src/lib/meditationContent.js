// ─── Supported Languages ───────────────────────────────────────────────────
export const LANGUAGES = [
  { id: 'en', code: 'en-IN', name: 'English', native: 'English', icon: '🇬🇧' },
  { id: 'hi', code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', icon: '🇮🇳' },
  { id: 'mr', code: 'mr-IN', name: 'Marathi', native: 'मराठी', icon: '🇮🇳' },
  { id: 'ta', code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', icon: '🇮🇳' },
  { id: 'ml', code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', icon: '🇮🇳' },
]

// ─── Localized Breath Guidance Labels ──────────────────────────────────────
export const BREATH_LABELS = {
  en: { inhale: 'BREATHE IN', hold: 'HOLD', exhale: 'BREATHE OUT', sec: 'seconds', remaining: 'remaining', hint: '🌿 Close your eyes and follow the breath' },
  hi: { inhale: 'सांस अंदर लें', hold: 'रोकें', exhale: 'सांस छोड़ें', sec: 'सेकंड', remaining: 'शेष समय', hint: '🌿 अपनी आँखें बंद करें और सांस पर ध्यान दें' },
  mr: { inhale: 'श्वास आत घ्या', hold: 'थांबा', exhale: 'श्वास सोडा', sec: 'सेकंद', remaining: 'उरलेला वेळ', hint: '🌿 डोळे बंद करा आणि श्वासावर लक्ष केंद्रित करा' },
  ta: { inhale: 'மூச்சை உள்ளிழுக்கவும்', hold: 'நிறுத்தவும்', exhale: 'மூச்சை வெளிவிடவும்', sec: 'விநாடிகள்', remaining: 'மீதமுள்ள நேரம்', hint: '🌿 கண்களை மூடி சுவாசத்தை கவனியுங்கள்' },
  ml: { inhale: 'ശ്വാസം ഉള്ളിലേക്ക്', hold: 'പിടിക്കുക', exhale: 'ശ്വാസം പുറത്തേക്ക്', sec: 'സെക്കൻഡ്', remaining: 'ബാക്കി സമയം', hint: '🌿 കണ്ണുകൾ അടച്ച് ശ്വാസത്തിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക' },
}

// ─── Multi-Language Meditation Programs ───────────────────────────────────
export const PROGRAMS = [
  {
    id: 'ravi_shankar_10min',
    title: '10-Min Meditation · Sri Sri Ravi Shankar',
    guide: 'Gurudev Sri Sri Ravi Shankar',
    category: 'Deep Calm',
    icon: '🧘',
    color: '#d97706',
    duration: 628,
    difficulty: 'All levels',
    defaultAmbient: 'none',
    audioUrl: '/audio/meditations/ravi_shankar_10min.mp3',
    artworkUrl: '/images/meditation-ravi-shankar.png',
    hasMasterAudio: true,
    moodMatch: ['sadness', 'fear', 'anger', 'neutral', 'joy'],
    description: 'A sublime 10-minute bilingual guided meditation on breath, body awareness, and boundless stillness by Gurudev Sri Sri Ravi Shankar.',
    whyGeneric: 'Connect with inner stillness, soften mental chatter, and repose in deep peace with Gurudev Sri Sri Ravi Shankar.',
    phases: [
      {
        start: 0, end: 20, breath: { inhale: 4, hold: 2, exhale: 4 },
        caption: 'Let us sit comfortably and easily. Keep our spine erect, रीढ़ की हड्डी सीधा रखें, कंधों को ढीला छोड़ दें, और आंखें बंद कर लीजिएगा.',
        instruction: {
          en: 'Sit comfortably and easily. Keep your spine erect, loosen shoulders, and gently close your eyes.',
          hi: 'आराम से बैठ जाएं। रीढ़ की हड्डी सीधी रखें, कंधों को ढीला छोड़ दें, और आंखें बंद कर लीजिए।',
          mr: 'शांत आणि आरामदायक स्थितीत बसा. पाठीचा कणा सरळ ठेवा, खांदे सैल सोडा आणि हळूच डोळे मिटून घ्या.',
          ta: 'வசதியாக அமருங்கள். முதுகெலும்பை நேராக வைத்து, தோள்களை தளர்த்தி, கண்களை மெதுவாக மூடுங்கள்.',
          ml: 'സുഖമായി ഇരിക്കുക. നട്ടെല്ല് നേരെയാക്കി, തോളുകൾ അയച്ചു, സാവധാനം കണ്ണുകൾ അടയ്ക്കുക.',
        },
        voice: {
          en: 'Sit comfortably and easily. Keep your spine erect, loosen your shoulders, and gently close your eyes.',
          hi: 'आराम से बैठ जाएं। रीढ़ की हड्डी सीधी रखें, कंधों को ढीला छोड़ें, और आंखें बंद कर लें।',
          mr: 'शांत बसा. कणा सरळ ठेवा, खांदे सैल सोडा आणि डोळे मिटा.',
          ta: 'வசதியாக அமருங்கள். கண்களை மூடுங்கள்.',
          ml: 'സുഖമായി ഇരിക്കുക. കണ്ണുകൾ അടയ്ക്കുക.',
        }
      },
      {
        start: 21, end: 43, breath: { inhale: 4, hold: 4, exhale: 5 },
        caption: 'एक गहरी सांस लीजिए, और सांस को रोकिए. और रोकना छोड़ दें, सांस अपने आप बाहर निकलने दें.',
        instruction: {
          en: 'Take a deep breath in, and gently hold the breath. Then release the hold, letting the breath flow out on its own.',
          hi: 'एक गहरी सांस लीजिए, और सांस को रोकिए। और रोकना छोड़ दें, सांस अपने आप बाहर निकलने दें।',
          mr: 'एक दीर्घ श्वास आत घ्या आणि रोखून धरा. नंतर हळूच श्वास आपोआप बाहेर पडू द्या.',
          ta: 'ஆழமாக மூச்சை உள்ளிழுத்து நிறுத்தவும். பின்னர் விட்டுவிடவும், மூச்சு தானாக வெளிவரட்டும்.',
          ml: 'ഒരു ദീർഘശ്വാസം ഉള്ളിലേക്ക് എടുത്ത് പിടിക്കുക. പിന്നീട് ശ്വാസം പുറത്തുപോകാൻ അനുവദിക്കുക.',
        },
        voice: {
          en: 'Take a deep breath in and hold. Now let go, and let the breath flow out.',
          hi: 'एक गहरी सांस लें और रोकें। अब छोड़ दें, सांस बाहर जाने दें।',
          mr: 'दीर्घ श्वास घ्या आणि थांबवा. आता श्वास बाहेर पडू द्या.',
          ta: 'ஆழமாக சுவாசித்து நிறுத்தவும். பின் வெளிவிடவும்.',
          ml: 'ദീർഘശ്വാസമെടുത്ത് നിർത്തുക. ശേഷം വിട്ടയക്കുക.',
        }
      },
      {
        start: 44, end: 78, breath: { inhale: 4, hold: 4, exhale: 6 },
        caption: 'और अपने आप सांस फिर भरने लगेगा, भरने दीजिए. सांस पूरी तरह से भरने के बाद रोकिए. जब सांस रोकते हैं मन की स्थिति देख लीजिएगा. और रोकना धीरे-धीरे छोड़िए, और सांस अपने आप बाहर आने लग जाएगी.',
        instruction: {
          en: 'Breath fills on its own; let it fill. Once fully filled, pause and hold. Observe the state of your mind as you hold. Slowly release.',
          hi: 'सांस अपने आप भरने लगेगी, भरने दें। पूरी तरह भरने के बाद रोकें। सांस रोकते समय मन की स्थिति देखें। धीरे-धीरे छोड़ें।',
          mr: 'श्वास आपोआप भरू द्या. पूर्ण भरल्यावर रोखा. श्वास रोखताना मनाची शांत स्थिती अनुभवा. हळूहळू सोडा.',
          ta: 'மூச்சு தானாக நிரம்பட்டும். முழுமையாக நிரம்பியதும் நிறுத்தவும். மனதின் நிலையை கவனியுங்கள். மெதுவாக விடுங்கள்.',
          ml: 'ശ്വാസം നിറയാൻ അനുവദിക്കുക. ശേഷം പിടിക്കുക. മനസ്സിനെ നിരീക്ഷിക്കുക. സാവധാനം വിടുക.',
        },
        voice: {
          en: 'Let the breath fill on its own. Hold, observe your mind in stillness, and gently release.',
          hi: 'सांस भरने दें। रोककर मन की स्थिति देखें, और धीरे से छोड़ें।',
          mr: 'श्वास भरू द्या. रोखून मनाची स्थिती अनुभवा, आणि हळूच सोडा.',
          ta: 'மூச்சை நிறுத்தி மனதை கவனியுங்கள். மெதுவாக விடுங்கள்.',
          ml: 'ശ്വാസം പിടിച്ച് മനസ്സ് കാണുക. സാവധാനം വിടുക.',
        }
      },
      {
        start: 79, end: 133, breath: { inhale: 5, hold: 5, exhale: 6 },
        caption: 'फिर एक बार सांस लेंगे, सांस पूरा भरने के बाद रोकेंगे. रोककर अपना मन की स्थिति पर ध्यान देंगे. सब थम सा गया है, सब रुक गया है. सांस रुकते ही मन भी रुक जाता है. और ज्यादा रोक नहीं पाएंगे तो आप रोकना बंद कर दीजिए. अब शरीर को सुकून मिल रहा है, विश्राम मिल रहा है.',
        instruction: {
          en: 'Once again, breathe in deeply and hold. Notice your mind. Everything has come to a standstill. As the breath pauses, the mind pauses. Rest in this profound relief.',
          hi: 'फिर एक बार सांस लेंगे और रोकेंगे। मन की स्थिति पर ध्यान दें। सब थम सा गया है। सांस रुकते ही मन भी रुक जाता है। शरीर को विश्राम और सुकून मिल रहा है।',
          mr: 'पुन्हा एकदा दीर्घ श्वास घ्या आणि थांबवा. सर्व काही स्तब्ध झाले आहे. श्वास थांबताच मनही शांत होते. शरीराला विश्रांती अनुभवू द्या.',
          ta: 'மீண்டும் ஆழமாக சுவாசித்து நிறுத்தவும். எல்லாம் அமைதியாகிவிட்டது. மூச்சு நின்றதும் மனமும் அமைதியாகிறது. உடல் ஓய்வெடுக்கிறது.',
          ml: 'വീണ്ടും ദീർഘമായി ശ്വാസമെടുത്ത് നിർത്തുക. മനസ്സ് പൂർണ്ണ ശാന്തതയിലാണ്. ശരീരം ആഴത്തിൽ വിശ്രമിക്കുന്നു.',
        },
        voice: {
          en: 'Breathe in and hold. As the breath pauses, the mind pauses. Rest in deep peace.',
          hi: 'सांस लें और रोकें। सांस रुकते ही मन भी ठहर जाता है। गहरे विश्राम में रहें।',
          mr: 'श्वास घ्या आणि थांबा. श्वास थांबताच मन शांत होते. विश्रांती घ्या.',
          ta: 'சுவாசித்து நிறுத்துங்கள். மனம் அமைதியாகிறது. ஓய்வெடுங்கள்.',
          ml: 'ശ്വാസമെടുത്ത് നിർത്തുക. മനസ്സ് ശാന്തമാകുന്നു. വിശ്രമിക്കുക.',
        }
      },
      {
        start: 134, end: 186, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: 'मन ही मन अपना शरीर के प्रति सम्मान का भाव रखें. अरबों खरबों अणु परमाणुओं से बना है आपका शरीर. यह शरीर हमारे लिए मिला हुआ एक अद्भुत देन है. Honor your own body, your body is the most precious gift to you from nature.',
        instruction: {
          en: 'Hold deep reverence for your body. Formed from trillions of atoms and cells, your body is nature\'s most precious gift to you.',
          hi: 'मन ही मन अपने शरीर के प्रति सम्मान का भाव रखें। अरबों खरबों अणु-परमाणुओं से बना यह शरीर प्रकृति की अनमोल देन है।',
          mr: 'मनातल्या मनात शरीराबद्दल कृतज्ञता बाळगा. अब्जावधी पेशींनी बनलेले हे शरीर निसर्गाची अनमोल भेट आहे.',
          ta: 'உங்கள் உடலுக்கு ஆழ்ந்த மரியாதை செலுத்துங்கள். இது இயற்கையின் விலைமதிப்பற்ற பரிசு.',
          ml: 'നിങ്ങളുടെ ശരീരത്തെ ആദരിക്കുക. പ്രകൃതി തന്ന വിലമതിക്കാനാവാത്ത സമ്മാനമാണിത്.',
        },
        voice: {
          en: 'Honor your own body. It is the most precious gift to you from nature.',
          hi: 'अपने शरीर के प्रति सम्मान रखें। यह प्रकृति का अनमोल उपहार है।',
          mr: 'शरीराबद्दल आदर बाळगा. ही निसर्गाची अनमोल देणगी आहे.',
          ta: 'உங்கள் உடலை மதியுங்கள். இது இயற்கையின் கொடை.',
          ml: 'ശരീരത്തെ ആദരിക്കുക. പ്രകൃതിയുടെ സമ്മാനമാണിത്.',
        }
      },
      {
        start: 187, end: 252, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: 'Now become aware of the air all around you and inside of you. The second dimension: the breath. It is the breath that is keeping us alive. यह सांस ही हमारा साथी रही है. जैसे जल में मछली, ऐसे हवा में हम हैं. Feel the air inside and outside simultaneously.',
        instruction: {
          en: 'Awaken to the second dimension: the breath. Like fish in water, we live in an ocean of air. Feel the air inside and outside of you simultaneously.',
          hi: 'दूसरे आयाम के प्रति सजग हों: सांस। जैसे जल में मछली, वैसे हवा में हम हैं। भीतर और बाहर की हवा को एक साथ महसूस करें।',
          mr: 'दुसऱ्या मितीकडे लक्ष द्या: श्वास. जसा पाण्यात मासा, तसे आपण हवेत आहोत. आतील आणि बाहेरील हवा एकत्र अनुभवा.',
          ta: 'இரண்டாவது பரிமாணம்: சுவாசம். காற்றில் நாம் மீன் போல மிதக்கிறோம். உள் மற்றும் வெளி காற்றை ஒரே நேரத்தில் உணருங்கள்.',
          ml: 'രണ്ടാമത്തെ തലം: ശ്വാസം. നമ്മൾ വായുവിൽ മീനുകളെപ്പോലെയാണ്. അകത്തെയും പുറത്തെയും വായു അറിയുക.',
        },
        voice: {
          en: 'Become aware of the air all around and within you. Feel the air inside and outside simultaneously.',
          hi: 'भीतर और बाहर की हवा को एक साथ महसूस करें। यह सांस जीवन की साथी है।',
          mr: 'आतील आणि बाहेरील हवा एकत्र अनुभवा. श्वास आपला सोबती आहे.',
          ta: 'உள் மற்றும் வெளி காற்றை ஒரே நேரத்தில் உணருங்கள்.',
          ml: 'അകത്തും പുറത്തുമുള്ള വായുവിനെ അനുഭവിക്കുക.',
        }
      },
      {
        start: 253, end: 276, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: 'Now breathe in with a smile, and breathe out with a smile. As you smile, all the muscles in your face and the brain gets deep relaxation.',
        instruction: {
          en: 'Breathe in with a gentle smile, and breathe out with a smile. As you smile, facial muscles soften and the brain enjoys deep relaxation.',
          hi: 'मुस्कुराते हुए सांस लें, मुस्कुराते हुए सांस छोड़ें। चेहरे की मांसपेशियों और मस्तिष्क को गहरा विश्राम मिलता है।',
          mr: 'हसतमुखाने श्वास आत घ्या आणि सोडा. चेहऱ्याचे स्नायू आणि मेंदूला खोल विश्रांती मिळते.',
          ta: 'புன்னகையுடன் மூச்சை உள்ளிழுத்து, புன்னகையுடன் வெளிவிடுங்கள். முகம் மற்றும் மூளை தளர்வடைகிறது.',
          ml: 'പുഞ്ചിരിയോടെ ശ്വാസമെടുക്കുക, പുഞ്ചിരിയോടെ വിടുക. മനസ്സിന് ആഴത്തിലുള്ള വിശ്രമം ലഭിക്കുന്നു.',
        },
        voice: {
          en: 'Breathe in with a smile, breathe out with a smile. Let the brain deeply relax.',
          hi: 'मुस्कुराते हुए सांस लें और छोड़ें। मन को शांत होने दें।',
          mr: 'हसतमुखाने श्वास घ्या आणि सोडा. मेंदूला शांतता मिळू द्या.',
          ta: 'புன்னகையுடன் சுவாசியுங்கள். மனம் அமைதியடைகிறது.',
          ml: 'പുഞ്ചിരിയോടെ ശ്വാസമെടുക്കുക. മനസ്സ് വിശ്രമിക്കട്ടെ.',
        }
      },
      {
        start: 277, end: 313, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: 'अब तीसरे आयाम पर चलते हैं: मन. जिसमें विचार घूमते हैं, जहां भावनाएं उठती हैं. Our body is like the wick of a candle, the mind is a glow all around it.',
        instruction: {
          en: 'Step into the third dimension: the mind. Our body is like the wick of a candle; the mind is the luminous glow radiating all around it.',
          hi: 'तीसरे आयाम पर चलते हैं: मन। शरीर मोमबत्ती की बाती है, तो मन उसके चारों ओर फैला हुआ प्रकाश और ज्योति है।',
          mr: 'तिसऱ्या मितीकडे वळूया: मन. शरीर वात आहे, तर मन त्याभोवती पसरलेली ज्योत आहे.',
          ta: 'மூன்றாவது பரிமாணம்: மனம். உடல் மெழுகுவர்த்தி திரி என்றால், மனம் அதைச் சுற்றியுள்ள சுடர்.',
          ml: 'മൂന്നാമത്തെ തലം: മനസ്സ്. ശരീരം തിരിയാണെങ്കിൽ മനസ്സ് ചുറ്റുമുള്ള പ്രകാശമാണ്.',
        },
        voice: {
          en: 'Our body is like the wick of a candle; the mind is the glow all around it.',
          hi: 'शरीर बाती है, मन चारों ओर फैला प्रकाश है।',
          mr: 'शरीर वात आहे, मन भोवतालची ज्योत आहे.',
          ta: 'உடல் திரி என்றால், மனம் அதைச் சுற்றியுள்ள பிரகாசம்.',
          ml: 'ശരീരം തിരി, മനസ്സ് അതിൻ്റെ പ്രകാശം.',
        }
      },
      {
        start: 314, end: 374, breath: { inhale: 4, hold: 2, exhale: 6 },
        caption: 'शरीर बाती है तो मन ज्योति है. मन एक बादल जैसे शरीर के चारों ओर भीतर बाहर मंडराता है. Our body is inside the mind. As you relax, the mind expands, and your body relaxes.',
        instruction: {
          en: 'The body is inside the mind; rather, inside of you. As you relax, the mind expands, and as the mind expands, your body lets go.',
          hi: 'शरीर मन के भीतर समाया हुआ है। जैसे आप विश्राम करते हैं, मन का विस्तार होता है, और शरीर पूरी तरह शिथिल हो जाता है।',
          mr: 'शरीर मनात सामावले आहे. जसे तुम्ही शांत होता, मन विस्तारते आणि शरीर अधिक सैल होते.',
          ta: 'நீங்கள் ஓய்வெடுக்கும்போது மனம் விரிகிறது, உடல் ஆழமாக தளர்கிறது.',
          ml: 'നിങ്ങൾ വിശ്രമിക്കുമ്പോൾ മനസ്സ് വികസിക്കുന്നു, ശരീരം ശാന്തമാകുന്നു.',
        },
        voice: {
          en: 'As you relax, the mind expands, and as the mind expands, your body relaxes.',
          hi: 'जैसे आप विश्राम करते हैं, मन फैलता है और शरीर शांत होता है।',
          mr: 'विश्रांतीने मन विस्तारते आणि शरीर शांत होते.',
          ta: 'மனம் விரியும்போது, உடல் தளர்கிறது.',
          ml: 'മനസ്സ് വികസിക്കുമ്പോൾ, ശരീരം വിശ്രമിക്കുന്നു.',
        }
      },
      {
        start: 375, end: 446, breath: { inhale: 5, hold: 3, exhale: 6 },
        caption: 'मुस्कुराते मुस्कुराते विश्राम करें. जो भी विचार आ रहे हो मन में, आने दें. अच्छे, बुरे, सभी विचारों को गले लगा लें. सब विचारों को स्वीकार कर लें. You are much bigger than all these thoughts that hover in the mind.',
        instruction: {
          en: 'Rest with a gentle smile. Whatever thoughts arise—pleasant or unpleasant—welcome them all. You are infinitely vaster than these fleeting thoughts.',
          hi: 'मुस्कुराते हुए विश्राम करें। मन में जो भी विचार आएं, उन्हें स्वीकार कर लें। आप इन विचारों से कहीं अधिक विशाल और असीम हैं।',
          mr: 'हसत विश्रांती घ्या. येणाऱ्या सर्व विचारांना स्वीकार करा. तुम्ही या विचारांपेक्षा कितीतरी पटीने विशाल आहात.',
          ta: 'புன்னகையுடன் ஓய்வெடுங்கள். எண்ணங்களை விட நீங்கள் மிகவும் பெரியவர்.',
          ml: 'പുഞ്ചിരിയോടെ വിശ്രമിക്കുക. ചിന്തകളെല്ലാം വരട്ടെ. നിങ്ങൾ ചിന്തകൾക്കും അതീതനാണ്.',
        },
        voice: {
          en: 'Welcome all thoughts with a smile. You are much bigger than any thought.',
          hi: 'सभी विचारों को मुस्कुराकर स्वीकारें। आप विचारों से बहुत बड़े हैं।',
          mr: 'सर्व विचार स्वीकारा. तुम्ही विचारांपेक्षा महान आहात.',
          ta: 'அனைத்து எண்ணங்களையும் ஏற்றுக்கொள்ளுங்கள். நீங்கள் பெரியவர்.',
          ml: 'ചിന്തകളെ സ്വീകരിക്കുക. നിങ്ങൾ അതിലും വിശാലനാണ്.',
        }
      },
      {
        start: 447, end: 519, breath: { inhale: 5, hold: 3, exhale: 7 },
        caption: 'Become aware of the vast sky. विशाल गगन का स्मरण करें. हमारी चेतना आकाश जैसे विशाल है. You are like the blue sky, unaffected, untainted. Repose in yourself. Let go of all tensions.',
        instruction: {
          en: 'Contemplate the vast sky. Our consciousness is boundless like open space. Unaffected and untainted, let go of all tensions and repose in yourself.',
          hi: 'विशाल गगन का स्मरण करें। हमारी चेतना आकाश जैसी अनंत है। सब तनाव छोड़ दें और अपने आप में विश्राम करें।',
          mr: 'अथांग आकाशाचे स्मरण करा. आपली चेतना आकाशासारखी अथांग आहे. सर्व चिंता सोडून स्वतःमध्ये स्थिर व्हा.',
          ta: 'நீல வானத்தை நினையுங்கள். நம் உணர்வு எல்லையற்றது. அமைதியில் திளையுங்கள்.',
          ml: 'വിശാലമായ ആകാശം പോലെയാണ് നിങ്ങളുടെ ബോധം. എല്ലാ ഭാരങ്ങളും വിട്ട് വിശ്രമിക്കുക.',
        },
        voice: {
          en: 'You are like the vast blue sky, unaffected and untainted. Repose in yourself.',
          hi: 'आप नीले आकाश की तरह असीम हैं। अपने आप में विश्राम करें।',
          mr: 'तुम्ही आकाशासारखे असीम आहात. स्वतःमध्ये शांत व्हा.',
          ta: 'நீங்கள் வானம் போல எல்லையற்றவர். ஓய்வெடுங்கள்.',
          ml: 'നിങ്ങൾ ആകാശം പോലെ വിശാലനാണ്. ശാന്തമായിരിക്കുക.',
        }
      },
      {
        start: 520, end: 556, breath: { inhale: 4, hold: 2, exhale: 6 },
        caption: 'Any discomfort, any tension you feel anywhere in the body, just let it be. कहीं कोई तनाव लग रही हो, या असुविधा लग रहे, उसको रहने दें. वे अपने आप ठीक हो जाएंगे. आप अपने आप में विश्राम करें.',
        instruction: {
          en: 'Any sensation or tension anywhere in the body, simply let it be. It will soften and dissolve on its own. Settle deeply into your true being.',
          hi: 'शरीर में कहीं कोई तनाव या बेचैनी हो, उसे रहने दें। वह अपने आप शांत हो जाएगी। आप बस विश्राम में बने रहें।',
          mr: 'शरीरात काही अस्वस्थता असेल तर राहू द्या. ती आपोआप दूर होईल. शांतपणे पडून राहा.',
          ta: 'உடலில் எங்கு இறுக்கம் இருந்தாலும் இருக்கட்டும். அது தானாக அகலும்.',
          ml: 'ശരീരത്തിലെ പിരിമുറുക്കങ്ങളെ കാര്യമാക്കാതെ ശാന്തമായി ഇരിക്കുക.',
        },
        voice: {
          en: 'If you feel any tension, just let it be. Rest deeply in your true self.',
          hi: 'कोई भी तनाव हो, रहने दें। अपने आप में विश्राम करें।',
          mr: 'तणाव आपोआप दूर होईल. स्वतःमध्ये विश्रांती घ्या.',
          ta: 'இறுக்கத்தை விட்டுவிடுங்கள். ஓய்வெடுங்கள்.',
          ml: 'വിഷമങ്ങൾ വിട്ടൊഴിയട്ടെ. വിശ്രമിക്കുക.',
        }
      },
      {
        start: 557, end: 583, breath: { inhale: 5, hold: 4, exhale: 7 },
        caption: 'Take another deep breath in, breathe out. ॐ शान्तिः शान्तिः शान्तिः (Om Shanti, Shanti, Shantihi).',
        instruction: {
          en: 'Take another deep breath in, and gently exhale... Om Shanti, Shanti, Shantihi. Feel peace in body, mind, and soul.',
          hi: 'एक और गहरी सांस अंदर लें, और बाहर छोड़ें... ॐ शान्तिः शान्तिः शान्तिः। मन और आत्मा में शांति अनुभव करें।',
          mr: 'आणखी एक दीर्घ श्वास घ्या आणि सोडा... ॐ शान्तिः शान्तिः शान्तिः. मनात आणि देहात शांतता अनुभवा.',
          ta: 'ஆழமாக மூச்செடுத்து விடுங்கள்... ஓம் சாந்தி, சாந்தி, சாந்திஹி.',
          ml: 'ദീർഘശ്വാസമെടുത്ത് വിടുക... ഓം ശാന്തി, ശാന്തി, ശാന്തിഹി.',
        },
        voice: {
          en: 'Take another deep breath in, and breathe out. Om Shanti, Shanti, Shantihi.',
          hi: 'एक और गहरी सांस लें और छोड़ें... ॐ शान्तिः शान्तिः शान्तिः।',
          mr: 'श्वास घ्या आणि सोडा... ॐ शान्तिः शान्तिः शान्तिः.',
          ta: 'ஓம் சாந்தி, சாந்தி, சாந்திஹி.',
          ml: 'ഓം ശാന്തി, ശാന്തി, ശാന്തിഹി.',
        }
      },
      {
        start: 584, end: 628, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: 'धीरे से शरीर और परिसर के प्रति सजग हो जाएं. मुस्कुराते मुस्कुराते एक और गहरी सांस लें, और धीरे धीरे सांस छोड़ें. और आंखें खोल सकते हो. Let us open our eyes, slowly and gently.',
        instruction: {
          en: 'Gently become aware of your body and surroundings. With a peaceful smile, take a deep breath, exhale softly, and open your eyes.',
          hi: 'धीरे से अपने शरीर और आसपास के वातावरण के प्रति सजग हों। चेहरे पर मुस्कान लाएं, एक गहरी सांस लें, और धीरे से आंखें खोल लें।',
          mr: 'हळूच शरीर आणि परिसराची जाणीव ठेवा. हसतमुखाने दीर्घ श्वास घ्या, हळूच सोडा आणि डोळे उघडा.',
          ta: 'மெதுவாக உடலையும் சூழலையும் உணருங்கள். புன்னகையுடன் கண்களைத் திறக்கவும்.',
          ml: 'സാവധാനം ശരീരത്തെ അറിയുക. പുഞ്ചിരിയോടെ കണ്ണുകൾ തുറക്കുക.',
        },
        voice: {
          en: 'Slowly become aware of your body and space. Gently open your eyes feeling refreshed.',
          hi: 'शरीर के प्रति सजग हों। चेहरे पर मुस्कान के साथ आंखें खोलें।',
          mr: 'शरीराची जाणीव ठेवा. हसतमुखाने डोळे उघडा.',
          ta: 'மெதுவாக கண்களைத் திறந்து புத்துணர்ச்சி பெறுங்கள்.',
          ml: 'സാവധാനം കണ്ണുകൾ തുറന്ന് പുതിയ ഉണർവ് നേടുക.',
        }
      }
    ]
  },
  {
    id: 'choa_kok_sui_27min',
    title: 'Daily 30-Min Mind Refreshing · Master Choa Kok Sui',
    guide: 'Grand Master Choa Kok Sui',
    category: 'Energy & Healing',
    icon: '✨',
    color: '#ea580c',
    duration: 1598,
    difficulty: 'All levels',
    defaultAmbient: 'none',
    audioUrl: '/audio/meditations/choa_kok_sui_27min.mp3',
    artworkUrl: '/images/meditation-master.png',
    hasMasterAudio: true,
    moodMatch: ['sadness', 'fear', 'anger', 'neutral', 'joy'],
    description: "Grand Master Choa Kok Sui's extremely powerful Twin Hearts Meditation for deep peace, illumination, blessing the Earth, and daily mind rejuvenation.",
    whyGeneric: "Daily 30-min mind refreshing with Grand Master Choa Kok Sui to activate Heart and Crown chakras, release stress, and experience profound stillness.",
    phases: [
      {
        start: 0, end: 90, breath: { inhale: 4, hold: 2, exhale: 4 },
        caption: "This is Master Choa Kok Sui. आपण गुरुदेव मास्टर चोआ कोक सुई आहात. Let us invoke for divine blessing. To the supreme God, my spiritual teacher, all the spiritual teachers, Holy masters, all the saints, Holy angels, spiritual helpers, and all the great ones: We humbly invoke for divine guidance, divine love, illumination, divine oneness, divine bliss, help and protection. We thank you in full faith.",
        instruction: {
          en: "Sit comfortably with an erect spine. Let us humbly invoke divine blessings, love, illumination, and divine oneness with full faith.",
          hi: "रीढ़ सीधी करके आराम से बैठें। पूरे विश्वास के साथ दिव्य आशीर्वाद, प्रेम, प्रकाश और एकात्मता का आह्वान करें।",
          mr: "पाठीचा कणा सरळ ठेवून शांत बसा. पूर्ण श्रद्धेने दिव्य मार्गदर्शन, प्रेम, ज्ञानप्रकाश आणि दिव्य एकात्मतेसाठी प्रार्थना करूया.",
          ta: "முதுகெலும்பை நேராக வைத்து அமருங்கள். முழு நம்பிக்கையுடன் தெய்வீக வழிகாட்டுதல், அன்பு மற்றும் அமைதிக்காக பிரார்த்திப்போம்.",
          ml: "നട്ടെല്ല് നേരെയാക്കി ഇരിക്കുക. പൂർണ്ണ വിശ്വാസത്തോടെ ദൈവിക അനുഗ്രഹം, സ്നേഹം, വെളിച്ചം എന്നിവയ്ക്കായി പ്രാർത്ഥിക്കുക.",
        },
        voice: {
          en: "Sit comfortably with your spine erect. Invoke divine blessings, divine love, and illumination in full faith.",
          hi: "आराम से बैठें और रीढ़ सीधी रखें। पूर्ण विश्वास के साथ दिव्य प्रकाश और प्रेम का आह्वान करें।",
          mr: "कणा सरळ ठेवून शांत बसा. पूर्ण श्रद्धेने दिव्य मार्गदर्शन आणि प्रेमाचे आवाहन करा.",
          ta: "நேராக அமருங்கள். தெய்வீக ஆசிகளை முழு நம்பிக்கையோடு நாடுங்கள்.",
          ml: "നേരെയിരിക്കുക. പൂർണ്ണ വിശ്വാസത്തോടെ ദൈവാനുഗ്രഹം തേടുക.",
        }
      },
      {
        start: 91, end: 125, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Connect your tongue to your palate. आपली जीभ आपल्या टाळ्याला लावा. Recall a happy event. Take your time. Re-experience the exquisite feelings of sweetness, of tenderness, and of love.",
        instruction: {
          en: "Connect your tongue to the roof of your mouth (palate). Recall a happy event and re-experience the feelings of sweetness, tenderness, and love.",
          hi: "अपनी जीभ को तालू से लगाएं। किसी सुखद घटना को याद करें और मधुरता, कोमलता और प्रेम का पुनः अनुभव करें।",
          mr: "आपली जीभ टाळ्याला लावा. एक सुखद आनंदाचा क्षण आठवा, आणि त्या गोडवा, कोमलता आणि प्रेमाचा पुन्हा अनुभव घ्या.",
          ta: "நாக்கின் நுனியை மேல் அண்ணத்தில் வைக்கவும். மகிழ்ச்சியான நினைவை எண்ணி அதன் இனிமையை உணருங்கள்.",
          ml: "നാക്ക് മേൽത്താടിയിൽ തൊടുക. ഒരു സന്തോഷകരമായ നിമിഷം ഓർത്തെടുത്ത് ആ സ്നേഹം വീണ്ടും അനുഭവിക്കുക.",
        },
        voice: {
          en: "Connect your tongue to your palate. Recall a happy event and re-experience feelings of sweetness and love.",
          hi: "जीभ को तालू से लगाएं। किसी सुखद पल को याद कर प्रेम और मधुरता का अनुभव करें।",
          mr: "जीभ टाळ्याला लावा. एक सुखद क्षण आठवून प्रेमाचा गोडवा अनुभवा.",
          ta: "நாக்கை அண்ணத்தில் தொட்டு மகிழ்ச்சியை உணருங்கள்.",
          ml: "നാക്ക് മേൽത്താടിയിൽ വെച്ച് സ്നേഹം അനുഭവിക്കുക.",
        }
      },
      {
        start: 126, end: 205, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "You are smiling. You are filled with love and happiness. Very gently and lovingly smile at your heart center. Your heart center is a being of love. Say words of love and sweetness to your heart. Can you feel your heart center responding with love, with joy and bliss?",
        instruction: {
          en: "Smile gently and lovingly at your heart center. Speak words of sweetness and love to your heart. Feel it blossoming with joy and bliss.",
          hi: "अपने हृदय केंद्र पर धीरे और प्यार से मुस्कुराएं। अपने दिल से प्रेम और मिठास के शब्द कहें और आनंद का अनुभव करें।",
          mr: "आपल्या हृदय केंद्रावर अत्यंत हळुवारपणे स्मितहास्य करा. हृदयाशी प्रेमाचे शब्द बोला आणि ते प्रेम, आनंद व हर्षाने प्रतिसाद देत असल्याचे अनुभवा.",
          ta: "உங்கள் இதய மையத்தை நோக்கி மென்மையாக புன்னகையுங்கள். இதயம் அன்பாலும் மகிழ்ச்சியாலும் மலர்வதை உணருங்கள்.",
          ml: "ഹൃദയ കേന്ദ്രത്തിലേക്ക് പുഞ്ചിരിക്കുക. ഹൃദയത്തോട് സ്നേഹത്തോടെ സംസാരിച്ച് ദിവ്യാനന്ദം അനുഭവിക്കുക.",
        },
        voice: {
          en: "Smile gently at your heart center. Say words of love to your heart, feeling it respond with joy.",
          hi: "हृदय पर मुस्कुराएं। अपने दिल से प्यार के शब्द कहें और उसे आनंद से भरते देखें।",
          mr: "हृदयावर प्रेमाने स्मितहास्य करा. प्रेमाचे शब्द बोलून त्याचा आनंद अनुभवा.",
          ta: "இதயத்தை நோக்கி புன்னகைத்து அன்பு செலுத்துங்கள்.",
          ml: "ഹൃദയത്തിലേക്ക് പുഞ്ചിരിച്ച് സ്നേഹം പകരുക.",
        }
      },
      {
        start: 206, end: 286, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Recall another happy event. Smile at your crown center. Your crown center is a being of divine love. Say words of love to this being of divine love. Lovingly and gently smile at your crown center. Can you feel your crown center responding with divine love and divine sweetness?",
        instruction: {
          en: "Recall another happy moment. Smile at your crown center atop your head. Feel your crown responding with divine sweetness and divine love.",
          hi: "एक और सुखद पल याद करें। सिर के शीर्ष (क्राउन केंद्र) पर मुस्कुराएं और महसूस करें कि वह दिव्य प्रेम से भर रहा है।",
          mr: "दुसरी सुखद घटना आठवा. डोक्यावरील ब्रह्म (क्राउन) केंद्रावर प्रेमाने स्मितहास्य करा. दिव्य प्रेम आणि मधुरतेचा प्रतिसाद अनुभवा.",
          ta: "மற்றொரு மகிழ்ச்சியான தருணத்தை நினையுங்கள். தலை உச்சி மையத்தை நோக்கி புன்னகையித்து தெய்வீக அன்பை உணருங்கள்.",
          ml: "മറ്റൊരു സന്തുഷ്ട നിമിഷം ഓർക്കുക. ശിരസ്സിന്റെ മുകളിലുള്ള ക്രൗൺ കേന്ദ്രത്തിലേക്ക് പുഞ്ചിരിച്ച് ദിവ്യസ്നേഹം അറിയുക.",
        },
        voice: {
          en: "Smile at your crown center. Feel it responding with boundless divine love and sweetness.",
          hi: "सिर के शीर्ष पर मुस्कुराएं। उसे असीम दिव्य प्रेम और मधुरता से खिलते महसूस करें।",
          mr: "माथ्यावरील ब्रह्म केंद्रावर स्मितहास्य करा. दिव्य प्रेमाचा प्रतिसाद अनुभवा.",
          ta: "தலை உச்சியில் புன்னகைத்து தெய்வீக அன்பை உணருங்கள்.",
          ml: "ക്രൗൺ കേന്ദ്രത്തിലേക്ക് പുഞ്ചിരിച്ച് ദിവ്യസ്നേഹം അറിയുക.",
        }
      },
      {
        start: 287, end: 419, breath: { inhale: 4, hold: 2, exhale: 4 },
        caption: "We are going to bless the Earth with loving kindness using the prayer of Saint Francis of Assisi. Raise your hands with palms facing outward. Imagine the Earth in front of you, the size of a small ball. Be aware of your heart and silently repeat after me: Lord, make me an instrument of your peace.",
        instruction: {
          en: "Raise your hands facing outward. Envision Earth as a small ball before you. Pray: Lord, make me an instrument of your peace. Radiate peace to the Earth.",
          hi: "हाथ ऊपर उठाएं, हथेलियां बाहर की ओर। पृथ्वी को एक छोटी गेंद के रूप में देखें। कहें: हे ईश्वर, मुझे अपनी शांति का माध्यम बना। शांति भेजें।",
          mr: "हात छातीसमोर वर उचला. पृथ्वीला लहान चेंडूसारखी समोर कल्पून म्हणा: हे ईश्वरा, मला तुझ्या शांततेचे माध्यम बनू दे. पृथ्वीला शांतीचा आशीर्वाद द्या.",
          ta: "கைகளை உயர்த்தி பூமியை ஒரு சிறிய பந்தாக கற்பனை செய்யுங்கள். இறைவனின் அமைதிக்கான கருவியாக மாறி அமைதியை பூமியெங்கும் பரப்புங்கள்.",
          ml: "കൈകൾ ഉയർത്തി ഭൂമിയെ ഒരു പന്തായി കാണുക. ദൈവത്തിന്റെ സമാധാനത്തിന്റെ ഉപകരണമായി മാറി ഭൂമിയിലേക്ക് സമാധാനം ചൊരിയുക.",
        },
        voice: {
          en: "Raise your hands facing outward. Envision Earth before you and radiate divine peace to all beings.",
          hi: "हाथ ऊपर उठाएं और पृथ्वी को अपने सामने देखकर संपूर्ण सृष्टि को शांति का आशीर्वाद दें।",
          mr: "हात वर उचला आणि पृथ्वीला दिव्य शांततेचा आशीर्वाद द्या.",
          ta: "கைகளை உயர்த்தி பூமிக்கு அமைதியை ஆசீர்வதியுங்கள்.",
          ml: "കൈകൾ ഉയർത്തി ഭൂമിയിലേക്ക് സമാധാനം ആശംസിക്കുക.",
        }
      },
      {
        start: 420, end: 493, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Where there is hatred, let me sow love. जेथे द्वेष आहे, तेथे मला प्रेमाचे बीज रुजवू दे. Feel the love flowing from your heart to your arms and hands, going to the small Earth in front of you. Bless the Earth with peace and with love.",
        instruction: {
          en: "Where there is hatred, sow love. Feel divine love flowing from your heart and hands into the Earth, soothing and healing all hearts.",
          hi: "जहाँ नफरत है, वहाँ प्यार बोएं। अपने दिल और हाथों से पृथ्वी में दिव्य प्रेम बहने दें, सभी को शांत और ठीक करें।",
          mr: "जेथे द्वेष आहे, तेथे प्रेमाचे बीज रुजवू द्या. आपल्या हृदयातून वाहणारे प्रेम हातातून पृथ्वीकडे जात असल्याचे अनुभवा.",
          ta: "வெறுப்பு உள்ள இடத்தில் அன்பை விதைக்கவும். உங்கள் இதயத்திலிருந்து பிரவாகிக்கும் தெய்வீக அன்பை பூமிக்கு அனுப்புங்கள்.",
          ml: "വിദ്വേഷമുള്ളിടത്ത് സ്നേഹം വിതയ്ക്കുക. നിങ്ങളുടെ ഹൃദയത്തിൽ നിന്നും കൈകളിൽ നിന്നും സ്നേഹം ഭൂമിയിലേക്ക് ഒഴുകട്ടെ.",
        },
        voice: {
          en: "Where there is hatred, sow love. Let unconditional love flow from your hands to the Earth.",
          hi: "नफरत की जगह प्यार बोएं। अपने हाथों से पूरी पृथ्वी पर निस्वार्थ प्रेम की वर्षा करें।",
          mr: "द्वेषाच्या जागी प्रेम रुजवा. हातातून पृथ्वीवर प्रेमाचा वर्षाव होऊ द्या.",
          ta: "வெறுப்புக்கு பதிலாக அன்பை பொழியுங்கள்.",
          ml: "സ്നേഹം കൊണ്ട് ലോകത്തെ അനുഗ്രഹിക്കുക.",
        }
      },
      {
        start: 494, end: 537, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Where there is injury, pardon. जेथे दुखापत, तेथे क्षमा. Allow yourself to be a channel for divine forgiveness, divine reconciliation. Bless the Earth with forgiveness, harmony, and peace.",
        instruction: {
          en: "Where there is injury, pardon. Radiate divine forgiveness and reconciliation. Let there be understanding, harmony, and peace across Earth.",
          hi: "जहाँ चोट है, वहाँ क्षमा हो। दिव्य क्षमा और मेल-मिलाप का माध्यम बनें। पूरी दुनिया में सद्भाव और शांति फैलने दें।",
          mr: "जेथे दुखापत, तेथे क्षमा. स्वतःला दिव्य क्षमा आणि सुसंगतीचे माध्यम बनवा. सर्वत्र समंजसपणा, सुसंगती व शांतता पसरू द्या.",
          ta: "காயம் உள்ள இடத்தில் மன்னிப்பை பரப்புங்கள். உலகெங்கும் நல்லிணக்கமும் சமாதானமும் நிலவட்டும்.",
          ml: "മുറിവേറ്റ ഇടങ്ങളിൽ ക്ഷമ പകരുക. ദൈവത്തിന്റെ കാരുണ്യവും ഐക്യവും ഭൂമിയിലെങ്ങും നിറയട്ടെ.",
        },
        voice: {
          en: "Where there is injury, pardon. Bless the Earth with forgiveness and harmony.",
          hi: "जहाँ चोट है क्षमा लाएं। दुनिया को क्षमा और सद्भाव का आशीर्वाद दें।",
          mr: "दुखापतीच्या जागी क्षमा आणा. पृथ्वीला समंजसपणाचा आशीर्वाद द्या.",
          ta: "மன்னிப்பையும் நல்லிணக்கத்தையும் ஆசீர்வதியுங்கள்.",
          ml: "ക്ഷമയും ഐക്യവും ലോകത്തിന് ആശംസിക്കുക.",
        }
      },
      {
        start: 538, end: 615, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Where there is despair, hope; doubt, faith. जेथे नैराश्य, तेथे आशा; संशय, तेथे विश्वास. Bless people having a difficult time with hope and faith. Silently tell them: You can make it. Bless them with divine strength.",
        instruction: {
          en: "Where there is despair, bring hope; where doubt, faith. Bless everyone going through hardship: 'You can make it.' Send them divine strength.",
          hi: "जहाँ निराशा है, आशा लाएं; जहाँ संशय है, विश्वास। कठिन समय से गुजर रहे लोगों को आशीर्वाद दें: 'आप कर सकते हैं।' दिव्य शक्ति भेजें।",
          mr: "जेथे नैराश्य तेथे आशा, संशयाच्या जागी विश्वास आणा. संकटात असलेल्या लोकांना सांगा: 'तुम्ही हे करू शकता.' त्यांना दिव्य शक्ती द्या.",
          ta: "நம்பிக்கையற்ற இடத்தில் நம்பிக்கையை கொண்டு வாருங்கள். கஷ்டத்தில் உள்ளோருக்கு மன வலிமையையும் ஊக்கத்தையும் ஆசீர்வதியுங்கள்.",
          ml: "നിരാശയുള്ളിടത്ത് പ്രത്യാശയും സംശയമുള്ളിടത്ത് വിശ്വാസവും പകരുക. കഷ്ടപ്പെടുന്നവർക്ക് ദൈവിക ശക്തി ആശംസിക്കുക.",
        },
        voice: {
          en: "Bring hope and faith to those in despair. Silently tell them: You can make it.",
          hi: "निराश लोगों को आशा और विश्वास दें। मन में कहें: आप कर सकते हैं।",
          mr: "संकटात असलेल्यांना सांगा: तुम्ही हे करू शकता. त्यांना आशा द्या.",
          ta: "நம்பிக்கையிழந்து தவிப்போருக்கு தைரியத்தையும் நம்பிக்கையையும் கொடுங்கள்.",
          ml: "വിഷമിക്കുന്നവർക്ക് പ്രത്യാശയും ആത്മവിശ്വാസവും പകരുക.",
        }
      },
      {
        start: 616, end: 675, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Where there is darkness, light; sadness, joy. जेथे अंधार आहे, तेथे प्रकाश; दुःख, तेथे आनंद. Bless the entire Earth with light and joy. Especially people who are sad, in pain, or depressed. Fill them with light and joy.",
        instruction: {
          en: "Where darkness, shine light; where sadness, bring joy. Pour uplifting light and joy upon those who are sad, hurting, or depressed.",
          hi: "जहाँ अंधकार है प्रकाश फैलाएं, जहाँ उदासी है खुशियां भरें। दुखी और निराश लोगों को दिव्य आनंद और प्रकाश से भर दें।",
          mr: "जेथे अंधार तेथे प्रकाश, जिथे दुःख तेथे आनंद आणा. संपूर्ण पृथ्वीवरील दुःखी व निराश लोकांना प्रकाश आणि आनंदाने भरून टाका.",
          ta: "இருளில் ஒளியையும், துக்கத்தில் மகிழ்ச்சியையும் பரப்புங்கள். துயரத்தில் உள்ள மக்களை மகிழ்ச்சியால் நிரப்புங்கள்.",
          ml: "ഇരുട്ടിൽ പ്രകാശവും ദുഃഖത്തിൽ ആനന്ദവും പകരുക. വേദനയനുഭവിക്കുന്നവരെ ദിവ്യപ്രകാശത്താൽ നിറയ്ക്കുക.",
        },
        voice: {
          en: "Radiate light into darkness and joy into sadness. Fill hurting souls with divine joy.",
          hi: "अंधकार में प्रकाश और दुख में आनंद लाएं। दुखी आत्माओं को दिव्य ज्योति से भरें।",
          mr: "अंधारात प्रकाश आणि दुःखात आनंद भरा. प्रत्येकाला शांती लाभू द्या.",
          ta: "இருளை நீக்கி ஒளியையும், துயரத்தை போக்கி மகிழ்ச்சியையும் பரப்புங்கள்.",
          ml: "പ്രകാശവും ആനന്ദവും കൊണ്ട് എല്ലാവരെയും അനുഗ്രഹിക്കുക.",
        }
      },
      {
        start: 676, end: 790, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Be aware of your crown. From the heart of God, let the entire Earth be blessed with loving-kindness, great joy, happiness, understanding, harmony, and divine peace, with goodwill and the will to do good.",
        instruction: {
          en: "Focus on your crown center. From the heart of God, bless Earth with great joy, harmony, and the goodwill to do real good in the world.",
          hi: "अपने क्राउन केंद्र पर ध्यान दें। ईश्वर के हृदय से पूरी पृथ्वी को दिव्य आनंद, सद्भाव और भलाई करने की प्रेरणा से आशीर्वाद दें।",
          mr: "ब्रह्म केंद्रावर लक्ष केंद्रित करा. ईश्वराच्या हृदयातून संपूर्ण पृथ्वीला विपुल आनंद, सद्भावना आणि सत्कार्य करण्याच्या संकल्पाचा आशीर्वाद द्या.",
          ta: "தலை உச்சியில் கவனம் செலுத்துங்கள். பூமியிலுள்ள அனைவரும் நன்மை செய்யும் நல்லெண்ணமும் ஆனந்தமும் பெற ஆசீர்வதியுங்கள்.",
          ml: "ക്രൗൺ കേന്ദ്രത്തിൽ ശ്രദ്ധിക്കുക. ലോകം മുഴുവൻ നന്മയും സ്നേഹവും സമാധാനവും നിറയാൻ ആത്മാർത്ഥമായി അനുഗ്രഹിക്കുക.",
        },
        voice: {
          en: "Be aware of your crown. Bless Earth with great joy, harmony, and goodwill to do good.",
          hi: "क्राउन केंद्र से पूरी दुनिया को आनंद, सद्भाव और भलाई का आशीर्वाद दें।",
          mr: "ब्रह्म केंद्रातून संपूर्ण विश्वाला सद्भावना आणि शांतीचा आशीर्वाद द्या.",
          ta: "உலக மக்கள் அனைவரும் நன்மை செய்ய ஆசீர்வதியுங்கள்.",
          ml: "എല്ലാവരിലും നന്മയും സമാധാനവും നിറയട്ടെ എന്ന് പ്രാർത്ഥിക്കുക.",
        }
      },
      {
        start: 791, end: 898, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Be aware of your heart and crown simultaneously. From the heart of God, let every person, every being be blessed with divine love, sweetness, joy, warmth, inner healing, divine bliss, and divine oneness with all.",
        instruction: {
          en: "Be aware of both heart and crown simultaneously. Project radiant golden light from your hands, bathing every soul in healing, warmth, and divine bliss.",
          hi: "हृदय और क्राउन दोनों पर एक साथ ध्यान दें। हाथों से स्वर्णिम प्रकाश प्रवाहित कर पूरी पृथ्वी को आरोग्य, प्रेम और दिव्य एकता से भरें।",
          mr: "हृदय आणि ब्रह्म केंद्रावर एकाच वेळी जागृत रहा. हातातून निघणारा सोनेरी प्रकाश संपूर्ण पृथ्वीला आंतरिक उपचार आणि दिव्य प्रेमाने भरत असल्याचे अनुभवा.",
          ta: "இதயத்தையும் தலை உச்சியையும் ஒரே நேரத்தில் உணருங்கள். கைகளில் இருந்து வெளிப்படும் தங்க ஒளியால் பூமி முழுவதையும் குணப்படுத்துங்கள்.",
          ml: "ഹൃദയത്തിലും ക്രൗണിലും ഒരേസമയം ശ്രദ്ധ കേന്ദ്രീകരിക്കുക. കൈകളിൽ നിന്ന് പുറപ്പെടുന്ന സ്വർണ്ണപ്രകാശത്താൽ ഭൂമിയെ സുഖപ്പെടുത്തുക.",
        },
        voice: {
          en: "Connect heart and crown. Channel golden light to bring inner healing and divine oneness to all.",
          hi: "दिल और क्राउन को जोड़ें। स्वर्णिम प्रकाश से सबको आंतरिक आरोग्य और शांति दें।",
          mr: "हृदय व ब्रह्म केंद्र जोडून सोनेरी प्रकाशाने जगाला निरोगी बनवा.",
          ta: "தங்க ஒளியால் உலகிற்கு உள் அமைதியை வழங்குங்கள்.",
          ml: "സ്വർണ്ണ പ്രകാശത്താൽ എല്ലാവരെയും രോഗമുക്തരും ശാന്തരുമാക്കുക.",
        }
      },
      {
        start: 899, end: 1042, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Gently put your hands down. Imagine a brilliant star or brilliant light on your crown. Silently chant the sacred mantra OM. Lovingly meditate on the brilliant star, and meditate on the interval of stillness between the OMs. And let go.",
        instruction: {
          en: "Rest your hands down. Visualize a brilliant star of white light upon your crown. Chant the sacred OM and meditate on the profound stillness between the OMs.",
          hi: "हाथ नीचे रखें। क्राउन पर एक चमकते तारे की कल्पना करें। मन में ॐ का जप करें और दो ॐ के बीच की नीरव शांति में लीन हो जाएं।",
          mr: "हात हळूच खाली ठेवा. माथ्यावर तेजस्वी ताऱ्याची कल्पना करा. ॐ मंत्राचे उच्चारण करा आणि दोन ॐ मधील अथांग शांततेत स्वतःला विलीन करा.",
          ta: "கைகளை கீழே வைக்கவும். தலை உச்சியில் ஒரு பிரகாசமான நட்சத்திரத்தை கற்பனை செய்து 'ஓம்' மந்திரத்தின் இடைவெளி அமைதியில் லையுங்கள்.",
          ml: "കൈകൾ താഴെ വെക്കുക. തലയ്ക്ക് മുകളിൽ ഒരു തിളങ്ങുന്ന നക്ഷത്രം കണ്ട് 'ഓം' മന്ത്രത്തിന്റെ നിശബ്ദതയിൽ ലയിക്കുക.",
        },
        voice: {
          en: "Rest your hands. Meditate on the brilliant star on your crown and the stillness between the OMs.",
          hi: "हाथ नीचे रखें। सिर पर चमकते तारे और ॐ के बीच की नीरव शांति पर ध्यान दें।",
          mr: "हात खाली ठेवा. तेजस्वी ताऱ्यावर आणि दोन ॐ मधील शांततेवर ध्यान धरा.",
          ta: "நட்சத்திரத்தின் பிரகாசத்திலும் 'ஓம்' மந்திரத்தின் அமைதியிலும் லையுங்கள்.",
          ml: "തിളങ്ങുന്ന നക്ഷത്രത്തിലും 'ഓം' മന്ത്രത്തിന്റെ നിശബ്ദതയിലും ശ്രദ്ധിക്കുക.",
        }
      },
      {
        start: 1043, end: 1159, breath: { inhale: 5, hold: 2, exhale: 6 },
        caption: "OM... OM... OM... Stillness... Pure Consciousness... Deep Transcendence... Let go into the infinite.",
        instruction: {
          en: "Chanting of OM. Drift effortlessly into the vast stillness and pure divine light between the vibrations. Let go completely.",
          hi: "ॐ की गूंज... दो ॐ के बीच की अनंत शांति और प्रकाश में पूरी तरह समर्पण करें और खो जाएं।",
          mr: "ॐ चा नाद... दोन ॐ मधील अलौकिक शांततेमध्ये स्वतःला मुक्त करा आणि आत्मिक प्रकाशात विलीन व्हा.",
          ta: "'ஓம்' அதிர்வு... எல்லை இல்லாத அமைதியிலும் தெய்வீக ஒளியிலும் உங்களை முழுமையாக ஆழ்த்துங்கள்.",
          ml: "'ഓം' ധ്വനി... അനന്തമായ നിശബ്ദതയിലേക്കും പ്രകാശത്തിലേക്കും പൂർണ്ണമായി സ്വയം സമർപ്പിക്കുക.",
        },
        voice: {
          en: "Drift into the stillness between the OMs. Let go into pure peace.",
          hi: "ॐ के बीच के मौन में विलीन हो जाएं। परम शांति में समर्पण करें।",
          mr: "ॐ मधील अथांग शांततेत विलीन व्हा. स्वतःला मुक्त करा.",
          ta: "மந்திர அமைதியில் உங்களை கரைத்துக்கொள்ளுங்கள்.",
          ml: "നിശബ്ദതയിൽ സ്വയം ലയിച്ചു ചേരുക.",
        }
      },
      {
        start: 1160, end: 1332, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Continue with your meditation. Relax and let go. (Deep Stillness & Tranquil Healing Music).",
        instruction: {
          en: "Deep silence and stillness. Rest in the timeless ocean of peace, recharging your physical, mental, and energy bodies.",
          hi: "गहरा मौन और विश्राम। परम शांति के इस महासागर में बने रहें और अपनी ऊर्जा को पुनः जागृत करें।",
          mr: "अथांग शांतता आणि विश्रांती. मनाला आणि शरीराला ताजेतवाने करणाऱ्या या दिव्य मौनात पूर्णपणे विश्राम करा.",
          ta: "ஆழ்ந்த அமைதியும் தியானமும். அமைதியின் கடலில் மூழ்கி உங்கள் உடலையும் மனதையும் புத்துணர்ச்சியூட்டுங்கள்.",
          ml: "ആഴത്തിലുള്ള നിശബ്ദത. പരമ ശാന്തിയിൽ വിശ്രമിച്ച് മനസ്സും ശരീരവും നവീകരിക്കുക.",
        },
        voice: {
          en: "Deep stillness. Rest in the quiet ocean of peace and recharge your mind.",
          hi: "गहन शांति। इस मौन में विश्राम करें और अपने मन को तरोताजा करें।",
          mr: "खोल शांतता. या मौनात मन आणि शरीराला विश्रांती द्या.",
          ta: "ஆழ்ந்த அமைதியில் ஓய்வெடுத்து மனதை புத்துணர்ச்சியாக்குங்கள்.",
          ml: "നിശബ്ദതയിൽ വിശ്രമിച്ച് മനസ്സിന് പുതുജീവൻ നൽകുക.",
        }
      },
      {
        start: 1333, end: 1453, breath: { inhale: 4, hold: 2, exhale: 4 },
        caption: "Very gently return to your body now. Raise your hands on chest level with palms outward. We are going to release excess energy. Let the entire Earth be blessed with divine light, love, power, peace, good health, and prosperity.",
        instruction: {
          en: "Gently return awareness to your body. Raise hands to release excess energy, blessing Earth with peace, health, abundance, and prosperity.",
          hi: "धीरे-धीरे अपने शरीर में वापस आएं। हाथ उठाकर अतिरिक्त ऊर्जा को मुक्त करें और पृथ्वी को स्वास्थ्य और समृद्धि का आशीर्वाद दें।",
          mr: "हळूच शरीराच्या जाणीवेकडे परत या. हाताचे तळवे पुढे करून अतिरिक्त ऊर्जा मुक्त करा आणि पृथ्वीला आरोग्य व समृद्धीचा आशीर्वाद द्या.",
          ta: "மெதுவாக உடலுக்குத் திரும்புங்கள். கைகளை உயர்த்தி கூடுதல் சக்தியை பூமிக்கு ஆசீர்வாதமாக வழங்கி ஆரோக்கியமும் வளமும் அளியுங்கள்.",
          ml: "സാവധാനം ശരീരത്തിലേക്ക് മടങ്ങുക. അധിക ഊർജ്ജം ഭൂമിയിലേക്ക് വിട്ട് ലോകത്തിന് സമൃദ്ധിയും ആരോഗ്യവും ആശംസിക്കുക.",
        },
        voice: {
          en: "Return awareness to your body. Raise hands and release excess energy, blessing the Earth.",
          hi: "शरीर की चेतना में लौटें। हाथ उठाकर अतिरिक्त ऊर्जा को पृथ्वी के कल्याण के लिए समर्पित करें।",
          mr: "शरीराच्या जाणीवेत या. हात उंचावून अतिरिक्त ऊर्जा मुक्त करा.",
          ta: "உடலுக்கு திரும்பி கூடுதல் சக்தியை பூமிக்கு ஆசீர்வதியுங்கள்.",
          ml: "ശരീരത്തിലേക്ക് മടങ്ങിയെത്തി അധിക ഊർജ്ജം ഭൂമിയിലേക്ക് വിടുക.",
        }
      },
      {
        start: 1454, end: 1598, breath: { inhale: 4, hold: 2, exhale: 5 },
        caption: "Gently be aware of the base of your spine and feet. Send light 10 feet down into the Earth. Bless Mother Earth to be regenerated. To the supreme God, my spiritual teacher, holy masters, and angels: thank you for the divine blessings. Gently open your eyes with a big smile.",
        instruction: {
          en: "Ground through your feet and spine into Mother Earth. Offer heartfelt thanks for the divine blessings. Gently open your eyes with a radiant smile.",
          hi: "पैरों और रीढ़ के माध्यम से पृथ्वी में स्थिर हों। दिव्य आशीर्वादों के लिए आभार व्यक्त करें और चेहरे पर मुस्कान के साथ आंखें खोलें।",
          mr: "पायाच्या तळांतून धरणीमातेत स्थिर व्हा. महान दिव्य आशीर्वादांसाठी कृतज्ञता व्यक्त करा आणि मोठ्या स्मितहास्यासह हळूच डोळे उघडा.",
          ta: "பாதங்கள் வழியாக பூமியோடு இணையுங்கள். தெய்வீக ஆசிகளுக்கு நன்றி கூறி புன்னகையோடு கண்களைத் திறக்கவும்.",
          ml: "പാദങ്ങളിലൂടെ ഭൂമിയിലേക്ക് ഊർജ്ജം നൽകി ബന്ധപ്പെടുക. ദൈവിക അനുഗ്രഹങ്ങൾക്ക് നന്ദി പറഞ്ഞ് പുഞ്ചിരിയോടെ കണ്ണുകൾ തുറക്കുക.",
        },
        voice: {
          en: "Ground down into Mother Earth. Give thanks for the divine blessings and gently open your eyes with a smile.",
          hi: "धरती में स्थिर हों। दिव्य कृपा के लिए धन्यवाद करें और मुस्कुराते हुए आंखें खोलें।",
          mr: "धरणीमातेप्रती कृतज्ञता व्यक्त करा आणि हसतमुखाने डोळे उघडा.",
          ta: "பூமியோடு இணைந்து நன்றி கூறி புன்னகையுடன் கண்களை திறக்கவும்.",
          ml: "ഭൂമിക്ക് നന്ദി പറഞ്ഞ് പുഞ്ചിരിയോടെ കണ്ണുകൾ തുറക്കുക.",
        }
      },
    ]
  },
  {
    id: 'stress_relief', title: 'Work Stress Relief', category: 'Stress', icon: '🌿',
    color: '#10b981', duration: 180, difficulty: 'Beginner', defaultAmbient: 'rain',
    moodMatch: ['anger', 'disgust'],
    description: 'Release workday pressure, tight shoulders, and mental overload in just 3 minutes.',
    whyGeneric: 'A short guided breathing session designed for moments when your mind feels busy.',
    phases: [
      {
        start: 0, end: 30, breath: { inhale: 4, hold: 2, exhale: 4 },
        instruction: {
          en: 'Find a comfortable position and let your shoulders relax.',
          hi: 'एक आरामदायक स्थिति में बैठें और अपने कंधों को ढीला छोड़ें।',
          mr: 'एका आरामदायक स्थितीत बसा आणि आपले खांदे सैल सोडा.',
          ta: 'ஒரு வசதியான நிலையில் அமர்ந்து உங்கள் தோள்களை தளர்த்தவும்.',
          ml: 'ഒരു സുഖപ്രദമായ നിലയിൽ ഇരിക്കുക, തോളുകൾ അയച്ചുവിടുക.',
        },
        voice: {
          en: 'Find a comfortable position. Let your shoulders drop.',
          hi: 'एक आरामदायक स्थिति में बैठें। अपने कंधों को ढीला छोड़ें।',
          mr: 'एका आरामदायक स्थितीत बसा. आपले खांदे सैल सोडा.',
          ta: 'ஒரு வசதியான நிலையில் அமருங்கள். உங்கள் தோள்களை தளர்த்தவும்.',
          ml: 'ഒരു സുഖപ്രദമായ നിലയിൽ ഇരിക്കുക. നിങ്ങളുടെ തോളുകൾ അയക്കുക.',
        }
      },
      {
        start: 30, end: 60, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Take a slow breath in through your nose, then let it go with a sigh.',
          hi: 'नाक से धीरे-धीरे गहरी सांस लें, और धीरे से छोड़ें।',
          mr: 'नाकाने हळूच दीर्घ श्वास घ्या आणि शांतपणे सोडा.',
          ta: 'மூக்கு வழியாக மெதுவாக மூச்சை உள்ளிழுத்து, மெதுவாக வெளிவிடுங்கள்.',
          ml: 'മൂക്കിലൂടെ പതുക്കെ ശ്വാസമെടുക്കുക, ശേഷം സാവധാനം പുറത്തുവിടുക.',
        },
        voice: {
          en: 'Take a slow breath in. Now gently breathe out with a sigh.',
          hi: 'धीरे-धीरे गहरी सांस अंदर लें। अब शांति से बाहर छोड़ें।',
          mr: 'हळूच दीर्घ श्वास आत घ्या. आता शांतपणे बाहेर सोडा.',
          ta: 'மெதுவாக மூச்சை உள்ளிழுக்கவும். இப்போது மெதுவாக வெளிவிடவும்.',
          ml: 'പതുക്കെ ശ്വാസം ഉള്ളിലേക്ക് എടുക്കുക. ഇപ്പോൾ സാവധാനം പുറത്തുവിടുക.',
        }
      },
      {
        start: 60, end: 100, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Whatever happened at work today, set it down for now. This moment is yours.',
          hi: 'आज जो भी हुआ उसे अभी के लिए छोड़ दें। यह समय सिर्फ आपका है।',
          mr: 'आज कामावर जे काही घडले ते विसरून जा. हा क्षण फक्त तुमचा आहे.',
          ta: 'இன்று நடந்த அனைத்தையும் மறந்துவிடுங்கள். இந்த தருணம் உங்களுக்கானது.',
          ml: 'ഇന്ന് സംഭവിച്ചതെല്ലാം ഇപ്പോൾ മാറ്റിവെക്കുക. ഈ നിമിഷം നിങ്ങൾക്കുള്ളതാണ്.',
        },
        voice: {
          en: 'Whatever happened today, set it down. This moment is yours.',
          hi: 'आज की सभी चिंताओं को छोड़ दें। यह पल सिर्फ आपका है।',
          mr: 'सर्व चिंता बाजूला ठेवा. हा क्षण फक्त तुमचा आहे.',
          ta: 'அனைத்து கவலைகளையும் ஒதுக்கி வையுங்கள். இந்த நேரம் உங்களுக்கானது.',
          ml: 'എല്ലാ ചിന്തകളും മാറ്റിവെക്കുക. ഈ സമയം നിങ്ങൾക്കുള്ളതാണ്.',
        }
      },
      {
        start: 100, end: 135, breath: { inhale: 4, hold: 3, exhale: 6 },
        instruction: {
          en: 'Notice where you are holding tension — your jaw, forehead, fists. Let them soften.',
          hi: 'ध्यान दें कि तनाव कहाँ है — माथा, जबड़ा या हाथ। उन्हें पूरी तरह ढीला छोड़ें।',
          mr: 'तणाव कुठे आहे ते पहा — कपाळ, जबडा किंवा हात. त्यांना सैल सोडा.',
          ta: 'உங்கள் முகம், தோள்கள் மற்றும் கைகளை முற்றிலும் தளர்த்தவும்.',
          ml: 'നിങ്ങളുടെ മുഖവും തോളുകളും അയച്ചു ശാന്തമാക്കുക.',
        },
        voice: {
          en: 'Notice where you hold tension. Let it soften.',
          hi: 'अपने शरीर के तनाव को महसूस करें और उसे ढीला छोड़ दें।',
          mr: 'शरीरातील तणाव ओळखा आणि तो सैल सोडा.',
          ta: 'உங்கள் உடலின் இறுக்கத்தை தளர்த்துங்கள்.',
          ml: 'ശരീരത്തിലെ പിരിമുറുക്കം അയച്ചുവിടുക.',
        }
      },
      {
        start: 135, end: 160, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'You don\'t need to solve anything right now. You are safe in this stillness.',
          hi: 'इस समय कुछ भी सुलझाने की जरूरत नहीं है। आप पूरी तरह शांत और सुरक्षित हैं।',
          mr: 'सध्या काहीही सोडवण्याची गरज नाही. तुम्ही शांत आणि सुरक्षित आहात.',
          ta: 'இப்போது எதையும் தீர்க்க தேவையில்லை. நீங்கள் அமைதியாக இருக்கிறீர்கள்.',
          ml: 'ഇപ്പോൾ ഒന്നും പരിഹരിക്കേണ്ടതില്ല. നിങ്ങൾ തികച്ചും ശാന്തനാണ്.',
        },
        voice: {
          en: 'You don\'t need to solve anything right now. You are safe.',
          hi: 'अभी किसी बात की चिंता न करें। आप सुरक्षित हैं।',
          mr: 'आता कसलीही काळजी करू नका. तुम्ही सुरक्षित आहात.',
          ta: 'இப்போது கவலைப்பட வேண்டாம். நீங்கள் அமைதியாக இருங்கள்.',
          ml: 'ഇപ്പോൾ വിഷമിക്കേണ്ടതില്ല. നിങ്ങൾ സുരക്ഷിതനാണ്.',
        }
      },
      {
        start: 160, end: 180, breath: { inhale: 5, hold: 3, exhale: 7 },
        instruction: {
          en: 'Take one last nourishing breath, bringing renewed calm back to your day.',
          hi: 'एक अंतिम गहरी सांस लें, और अपने दिन में नई शांति का अनुभव करें।',
          mr: 'एक शेवटचा दीर्घ श्वास घ्या आणि नवीन ऊर्जा अनुभवा.',
          ta: 'கடைசியாக ஒரு முறை ஆழமாக சுவாசித்து புத்துணர்ச்சி பெறுங்கள்.',
          ml: 'അവസാനമായി ഒരു ദീർഘശ്വാസം എടുത്ത് പുതിയ ഉണർവ് നേടുക.',
        },
        voice: {
          en: 'Take one last deep breath. Bring calm back to your day.',
          hi: 'एक अंतिम गहरी सांस लें। अपने दिन में शांति लाएं।',
          mr: 'एक शेवटचा दीर्घ श्वास घ्या. दिवसात शांतता आणा.',
          ta: 'ஆழமாக சுவாசித்து உங்கள் நாளை அமைதியுடன் தொடருங்கள்.',
          ml: 'ദീർഘശ്വാസം എടുത്ത് മനസ്സമാധാനത്തോടെ മുന്നോട്ട് പോവുക.',
        }
      },
    ]
  },
  {
    id: 'deep_relax', title: 'Deep Relaxation', category: 'Relaxation', icon: '💜',
    color: '#8b5cf6', duration: 300, difficulty: 'Beginner', defaultAmbient: 'singing_bowl',
    moodMatch: ['sadness'],
    description: 'Progressive body awareness to dissolve physical tightness and emotional weight.',
    whyGeneric: 'When your body feels heavy, this gentle scan can help release what you are carrying.',
    phases: [
      {
        start: 0, end: 35, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Close your eyes. Bring gentle attention to the crown of your head.',
          hi: 'आंखें बंद करें। अपना ध्यान अपने सिर के ऊपरी हिस्से पर लाएं।',
          mr: 'डोळे मिटा. आपले लक्ष डोक्याच्या वरच्या भागावर आणा.',
          ta: 'கண்களை மூடுங்கள். உங்கள் கவனத்தை தலையின் உச்சிக்கு கொண்டு வாருங்கள்.',
          ml: 'കണ്ണുകൾ അടയ്ക്കുക. ശ്രദ്ധ തലയുടെ മുകൾഭാഗത്തേക്ക് കൊണ്ടുവരിക.',
        },
        voice: {
          en: 'Close your eyes. Bring gentle attention to the top of your head.',
          hi: 'आंखें बंद करें। अपना ध्यान सिर के ऊपर केंद्रित करें।',
          mr: 'डोळे मिटा. आपले लक्ष डोक्यावर केंद्रित करा.',
          ta: 'கண்களை மூடி தலையின் உச்சியில் கவனம் செலுத்துங்கள்.',
          ml: 'കണ്ണുകൾ അടച്ച് തലയുടെ മുകളിൽ ശ്രദ്ധിക്കുക.',
        }
      },
      {
        start: 35, end: 75, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Soften the muscles around your eyes, cheeks, and jaw. Let your face relax completely.',
          hi: 'आंखों, गालों और जबड़े की मांसपेशियों को पूरी तरह ढीला छोड़ें।',
          mr: 'डोळे, गाल आणि जबड्याचे स्नायू पूर्णपणे सैल सोडा.',
          ta: 'உங்கள் கண்கள், கன்னங்கள் மற்றும் தாடையை தளர்த்தவும்.',
          ml: 'കണ്ണുകൾ, കവിളുകൾ, താടിയെല്ല് എന്നിവ അയച്ചുവിടുക.',
        },
        voice: {
          en: 'Soften your face. Let your jaw relax completely.',
          hi: 'चेहरे को ढीला छोड़ें। जबड़े को पूरी तरह शांत करें।',
          mr: 'चेहरा शांत ठेवा. जबडा सैल सोडा.',
          ta: 'முகத்தை தளர்த்தி அமைதியாக இருங்கள்.',
          ml: 'മുഖം ശാന്തമാക്കി താടിയെല്ല് അയക്കുക.',
        }
      },
      {
        start: 75, end: 120, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Move your awareness to your neck and shoulders. Imagine them melting downward.',
          hi: 'अपनी गर्दन और कंधों पर ध्यान दें। उन्हें नीचे की ओर ढीला छोड़ें।',
          mr: 'आपली मान आणि खांद्यांकडे लक्ष द्या. त्यांना सैल सोडा.',
          ta: 'கழுத்து மற்றும் தோள்களை தளர்த்தி ஓய்வெடுக்க விடுங்கள்.',
          ml: 'കഴുത്തും തോളുകളും അയച്ചു ശാന്തമാക്കുക.',
        },
        voice: {
          en: 'Move your awareness to your neck and shoulders. Let them melt.',
          hi: 'गर्दन और कंधों को पूरी तरह तनावमुक्त करें।',
          mr: 'मान आणि खांदे पूर्णपणे तणावमुक्त करा.',
          ta: 'கழுத்து மற்றும் தோள்பட்டையை தளர்த்தவும்.',
          ml: 'കഴുത്തും തോളും പൂർണ്ണമായി അയക്കുക.',
        }
      },
      {
        start: 120, end: 165, breath: { inhale: 5, hold: 3, exhale: 7 },
        instruction: {
          en: 'Feel your chest rise and fall. Breathe spaciousness into your heart.',
          hi: 'अपनी छाती के उठने और गिरने को महसूस करें। दिल में शांति भरें।',
          mr: 'छातीची हालचाल अनुभवा. मनात शांतता भरा.',
          ta: 'உங்கள் மார்பின் சுவாசத்தை உணருங்கள். இதயத்தில் அமைதியை நிரப்புங்கள்.',
          ml: 'നെഞ്ചിന്റെ ചലനം ശ്രദ്ധിക്കുക. ഹൃദയത്തിൽ സമാധാനം നിറയ്ക്കുക.',
        },
        voice: {
          en: 'Feel your chest rise and fall. Breathe into your heart.',
          hi: 'सांस की लय महसूस करें। हृदय में शांति लाएं।',
          mr: 'श्वासाची लय अनुभवा. मनात शांतता आणा.',
          ta: 'சுவாசத்தை உணர்ந்து அமைதி பெறுங்கள்.',
          ml: 'ശ്വാസം അനുഭവിച്ച് ശാന്തത കണ്ടെത്തുക.',
        }
      },
      {
        start: 165, end: 210, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Release any grip in your stomach and lower back. Let your breath be soft.',
          hi: 'पेट और पीठ के निचले हिस्से को ढीला छोड़ें। सांस को सहज रखें।',
          mr: 'पोट आणि पाठ सैल सोडा. श्वास सहज चालू द्या.',
          ta: 'வயிறு மற்றும் முதுகை தளர்த்தவும். சுவாசம் மென்மையாக இருக்கட்டும்.',
          ml: 'വയറും പുറംഭാഗവും അയക്കുക. ശ്വാസം സ്വാഭാവികമാക്കുക.',
        },
        voice: {
          en: 'Release any grip in your stomach. Let your breath be soft.',
          hi: 'पेट को पूरी तरह ढीला छोड़ें। सांस को कोमल बनाएं।',
          mr: 'पोट सैल सोडा. श्वास कोमल ठेवा.',
          ta: 'வயிற்றை தளர்த்தி மென்மையாக சுவாசிக்கவும்.',
          ml: 'വയറ് അയച്ച് മൃദുവായി ശ്വസിക്കുക.',
        }
      },
      {
        start: 210, end: 250, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Notice your hands, arms, and fingers. Feel warmth resting there.',
          hi: 'अपने हाथों, बाहों और उंगलियों को महसूस करें। वहाँ गर्माहट का अहसास करें।',
          mr: 'आपले हात आणि बोटांकडे लक्ष द्या. तेथे ऊब अनुभवा.',
          ta: 'உங்கள் கைகளையும் விரல்களையும் உணருங்கள்.',
          ml: 'കൈകളും വിരലുകളും ശ്രദ്ധിക്കുക. അവിടെ ഊഷ്മളത അനുഭവിക്കുക.',
        },
        voice: {
          en: 'Notice your hands and arms. Feel the warmth resting there.',
          hi: 'हाथों और बाहों को महसूस करें।',
          mr: 'हात आणि बोटांमधील शांतता अनुभवा.',
          ta: 'கைகளில் உள்ள அமைதியை உணருங்கள்.',
          ml: 'കൈകളിലെ ശാന്തത അറിയുക.',
        }
      },
      {
        start: 250, end: 280, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Bring awareness down to your legs, knees, and feet resting on the floor.',
          hi: 'अपना ध्यान पैरों और पंजों पर लाएं जो जमीन को छू रहे हैं।',
          mr: 'लक्ष पाय आणि तळपायांवर आणा जे जमिनीला टेकलेले आहेत.',
          ta: 'கவனத்தை கால்கள் மற்றும் பாதங்களுக்கு கொண்டு வாருங்கள்.',
          ml: 'ശ്രദ്ധ കാലുകളിലേക്കും പാദങ്ങളിലേക്കും കൊണ്ടുവരിക.',
        },
        voice: {
          en: 'Bring awareness to your legs and feet.',
          hi: 'पैरों और पंजों को पूरी तरह तनावमुक्त करें।',
          mr: 'पाय पूर्णपणे शिथिल करा.',
          ta: 'கால்களை தளர்த்தி ஓய்வு கொடுங்கள்.',
          ml: 'കാലുകൾ അയച്ച് ശാന്തമാക്കുക.',
        }
      },
      {
        start: 280, end: 300, breath: { inhale: 5, hold: 4, exhale: 8 },
        instruction: {
          en: 'Your entire body is relaxed, rested, and at peace. Stay here a moment longer.',
          hi: 'आपका पूरा शरीर शांत और तनावमुक्त है। कुछ देर इस शांति में रहें।',
          mr: 'तुमचे संपूर्ण शरीर शांत आणि तणावमुक्त झाले आहे.',
          ta: 'உங்கள் முழு உடலும் அமைதியாகவும் தளர்வாகவும் உள்ளது.',
          ml: 'നിങ്ങളുടെ ശരീരം മുഴുവൻ ശാന്തവും വിശ്രാന്തവുമാണ്.',
        },
        voice: {
          en: 'Your entire body is relaxed and at peace.',
          hi: 'आपका संपूर्ण शरीर पूरी तरह शांत और विश्राम में है।',
          mr: 'तुमचे संपूर्ण शरीर शांत आणि आनंदी आहे.',
          ta: 'உங்கள் உடல் முற்றிலும் அமைதியாக உள்ளது.',
          ml: 'നിങ്ങളുടെ ശരീരം തികച്ചും ശാന്തമാണ്.',
        }
      },
    ]
  },
  {
    id: 'morning_focus', title: 'Morning Focus & Clarity', category: 'Focus', icon: '🌅',
    color: '#f59e0b', duration: 150, difficulty: 'Beginner', defaultAmbient: 'alpha432',
    moodMatch: ['neutral', 'joy'],
    description: 'Awaken mental clarity and set a confident intention for the day ahead.',
    whyGeneric: 'Start your day with clear focus and calm confidence.',
    phases: [
      {
        start: 0, end: 25, breath: { inhale: 4, hold: 2, exhale: 4 },
        instruction: {
          en: 'Sit tall with an open chest. Welcome this fresh new moment.',
          hi: 'सीधे बैठें और सीना खुला रखें। इस नए खूबसूरत पल का स्वागत करें।',
          mr: 'ताठ बसा आणि छाती खुली ठेवा. या नवीन क्षणाचे स्वागत करा.',
          ta: 'நேராக அமருங்கள். இந்த புதிய தருணத்தை வரவேற்கவும்.',
          ml: 'നേരെ ഇരിക്കുക. ഈ പുതിയ നിമിഷത്തെ സ്വാഗതം ചെയ്യുക.',
        },
        voice: {
          en: 'Sit tall. Welcome this fresh new moment.',
          hi: 'सीधे बैठें। इस नए पल का स्वागत करें।',
          mr: 'ताठ बसा. या नवीन दिवसाचे स्वागत करा.',
          ta: 'நேராக அமர்ந்து இந்த புதிய நாளை வரவேற்கவும்.',
          ml: 'നേരെ ഇരിക്കുക. ഈ പുതിയ പ്രഭാതത്തെ സ്വാഗതം ചെയ്യുക.',
        }
      },
      {
        start: 25, end: 55, breath: { inhale: 5, hold: 3, exhale: 5 },
        instruction: {
          en: 'Take a deep, invigorating breath in. Fill your lungs with fresh energy.',
          hi: 'एक गहरी, ऊर्जावान सांस अंदर लें। फेफड़ों को ताजी ऊर्जा से भरें।',
          mr: 'दीर्घ आणि उत्साही श्वास घ्या. फुफ्फुसे ताजी ऊर्जेने भरा.',
          ta: 'ஆழமாக சுவாசித்து புதிய ஆற்றலை உணருங்கள்.',
          ml: 'ദീർഘമായി ശ്വാസമെടുത്ത് പുതിയ ഊർജ്ജം നിറയ്ക്കുക.',
        },
        voice: {
          en: 'Take a deep breath in. Fill your lungs with energy.',
          hi: 'गहरी सांस लें और ऊर्जा को महसूस करें।',
          mr: 'दीर्घ श्वास घ्या आणि नवीन ऊर्जा अनुभवा.',
          ta: 'ஆழமாக மூச்சை உள்ளிழுத்து ஆற்றலை நிரப்புங்கள்.',
          ml: 'ആഴത്തിൽ ശ്വാസമെടുക്കുക, ഊർജ്ജം നിറയ്ക്കുക.',
        }
      },
      {
        start: 55, end: 85, breath: { inhale: 4, hold: 2, exhale: 6 },
        instruction: {
          en: 'Exhale with clarity. Clear away any morning fog or hesitation.',
          hi: 'सांस छोड़ते हुए सभी आलस और संशय को दूर करें।',
          mr: 'श्वास सोडताना आळस आणि शंका दूर करा.',
          ta: 'சுவாசத்தை வெளிவிட்டு சோம்பலை நீக்குங்கள்.',
          ml: 'ശ്വാസം പുറത്തുവിട്ട് മടി അകറ്റുക.',
        },
        voice: {
          en: 'Exhale with clarity. Clear away any hesitation.',
          hi: 'स्पष्टता के साथ सांस छोड़ें। सभी झिझक दूर करें।',
          mr: 'स्पष्टतेने श्वास सोडा. सर्व आळस दूर करा.',
          ta: 'தெளிவுடன் மூச்சை வெளிவிடுங்கள்.',
          ml: 'വ്യക്തതയോടെ ശ്വാസം പുറത്തുവിടുക.',
        }
      },
      {
        start: 85, end: 120, breath: { inhale: 5, hold: 3, exhale: 6 },
        instruction: {
          en: 'Set an intention for today: calm focus, steady presence, and kindness.',
          hi: 'आज के लिए एक संकल्प लें: शांत एकाग्रता और दयालुता।',
          mr: 'आजचा संकल्प करा: शांत एकाग्रता आणि सकारात्मकता.',
          ta: 'இன்றைய நாளுக்கான நல்லெண்ணத்தை உருவாக்குங்கள்.',
          ml: 'ഇന്നത്തെ ദിവസത്തിനായി നല്ലൊരു ലക്ഷ്യം വെയ്ക്കുക.',
        },
        voice: {
          en: 'Set your intention. Calm focus, steady presence, and kindness.',
          hi: 'अपना संकल्प तय करें: शांत मन और दृढ़ एकाग्रता।',
          mr: 'आपला संकल्प निश्चित करा: शांत मन आणि एकाग्रता.',
          ta: 'மனதில் அமைதியையும் கவனத்தையும் நிலைநிறுத்துங்கள்.',
          ml: 'മനസ്സിൽ ഏകാഗ്രതയും സമാധാനവും നിലനിർത്തുക.',
        }
      },
      {
        start: 120, end: 150, breath: { inhale: 4, hold: 2, exhale: 5 },
        instruction: {
          en: 'Trust your ability to handle whatever comes today. You are ready.',
          hi: 'अपनी क्षमता पर विश्वास रखें। आप आज के दिन के लिए पूरी तरह तैयार हैं।',
          mr: 'स्वतःच्या क्षमतेवर विश्वास ठेवा. तुम्ही सज्ज आहात.',
          ta: 'உங்கள் மீது நம்பிக்கை வையுங்கள். நீங்கள் தயாராக உள்ளீர்கள்.',
          ml: 'സ്വയം വിശ്വസിക്കുക. നിങ്ങൾ പൂർണ്ണ സജ്ജനാണ്.',
        },
        voice: {
          en: 'Trust yourself. You are ready for today.',
          hi: 'खुद पर भरोसा रखें। आप तैयार हैं।',
          mr: 'स्वतःवर विश्वास ठेवा. तुम्ही सज्ज आहात.',
          ta: 'உங்களை நம்புங்கள். நீங்கள் தயாராக உள்ளீர்கள்.',
          ml: 'സ്വയം വിശ്വസിക്കുക. നിങ്ങൾ തയ്യാറാണ്.',
        }
      },
    ]
  }
]

// ─── Ambient Sound Options ─────────────────────────────────────────────────

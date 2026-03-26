import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal as RNModal,
  Animated,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft, Star, CheckCircle2, Heart, Share2, ThumbsUp, MessageSquare,
  X, ZoomIn, ChevronRight, Radio, Gavel, ShoppingBag, UserCheck,
} from 'lucide-react-native';
import Animated2, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';


const { width: SCREEN_W } = Dimensions.get('window');

const SELLER_DATA: Record<string, any> = {
  '1': {
    name: 'Anne Curtis', type: 'Celebrity', isCelebrity: true, isVerified: true,
    followers: '15.1M', following: '312', rating: 4.9,
    avatarUri: 'https://www.famousbirthdays.com/faces/curtis-anne-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    bio: "I want to make people happy. That's all I want to do.",
    about: "Anne Gabrielle Curtis-Smith (born February 17, 1985 in Melbourne, Australia) is a Filipino-Australian actress, TV host, singer, and DJ. She rose to fame in the Philippines through ABS-CBN's hit films and TV shows and became one of the country's most bankable stars.\n\nKnown for her versatility, Anne has starred in blockbuster films, hosted ASAP and It's Showtime, and released music that charted nationally. A proud Pinay at heart, she uses her platform to champion causes close to her.",
    advocacy: {
      title: 'Impact Beyond the Screen',
      intro: "Anne Curtis goes beyond entertainment to make a real difference:",
      items: [
        { label: 'UNICEF Philippines Ambassador', desc: 'Serves as a National Ambassador for UNICEF Philippines, advocating for children\'s rights and education.' },
        { label: 'Women Empowerment', desc: 'Champions inclusivity and body positivity in Philippine media through public campaigns and interviews.' },
        { label: 'Disaster Relief', desc: 'Actively raises funds and volunteers during typhoon and flood relief operations across the Philippines.' },
      ],
    },
    lifestyle: { title: "Celebrity's Lifestyle", body: "From red carpet events in Manila to intimate charity work in provinces, Anne Curtis lives with purpose and grace." },
    posts: [
      { id: 'post1', author: 'Anne Curtis', handle: '@annecurtissmith', timeAgo: '2 days', text: 'Just wrapped charity work with UNICEF Philippines. These kids are the real stars. 💙', images: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=80', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=300&q=80'], likes: 142, comments: 38 },
      { id: 'post2', author: 'Anne Curtis', handle: '@annecurtissmith', timeAgo: '1 week', text: 'Opening my closet for a cause! All proceeds go to Yolanda relief efforts.', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80'], likes: 98, comments: 27 },
    ],
    gallery: [
      'https://www.famousbirthdays.com/faces/curtis-anne-image.jpg',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
      'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=400&q=80',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80',
    ],
    products: [
      { id: 'p1', name: 'ASAP Stage Outfit', price: 9500, imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: true },
      { id: 'p2', name: 'Signed Concert Poster', price: 2100, imageUri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80', rating: 4.9, tag: 'Auctioned Item', isLive: true },
      { id: 'p3', name: 'Designer Tote Bag', price: 7000, imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80', rating: 4.7, tag: 'For Sale', isLive: false },
    ],
  },
  '2': {
    name: 'Vice Ganda', type: 'Celebrity', isCelebrity: true, isVerified: true,
    followers: '8.2M', following: '89', rating: 4.8,
    avatarUri: 'https://www.famousbirthdays.com/faces/ganda-vice-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80',
    bio: 'Ganda, comedy, and love — that is my legacy.',
    about: "Jose Marie Borja Viceral, known professionally as Vice Ganda (born March 22, 1976 in Paco, Manila), is one of the Philippines' most beloved comedians, actors, and TV hosts. He is best known for hosting ABS-CBN's noontime show It's Showtime.\n\nVice Ganda's rags-to-riches story and fearless humor have made him a cultural icon. He has starred in some of the highest-grossing Filipino films of all time and continues to be a top-rating TV personality.",
    advocacy: { title: 'Giving Back to Paco', intro: 'Vice Ganda never forgets his humble roots in Paco, Manila:', items: [
      { label: 'Scholars & Livelihood', desc: 'Funds scholarships and livelihood programs for youth in Paco, Manila and surrounding communities.' },
      { label: 'LGBTQ+ Inclusion', desc: 'Uses his massive platform to push for LGBTQ+ acceptance and representation in Philippine mainstream media.' },
      { label: 'Disaster Aid', desc: 'Has pledged millions of pesos to typhoon relief, flood victims, and COVID-19 aid programs.' },
    ]},
    lifestyle: { title: "Icon's Lifestyle", body: 'From the streets of Paco to the biggest stages in the country — Vice Ganda proves grit and humor can change a life.' },
    posts: [{ id: 'post3', author: 'Vice Ganda', handle: '@vicegandakoakasupak', timeAgo: '3 days', text: 'It\'s Showtime fam! Dropping some of my iconic stage pieces. Proceeds to scholars! 🎉', images: ['https://images.unsplash.com/photo-1501612780327-45045538702b?w=300&q=80'], likes: 204, comments: 61 }],
    gallery: ['https://www.famousbirthdays.com/faces/ganda-vice-image.jpg', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&q=80', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'],
    products: [
      { id: 'p4', name: 'It\'s Showtime Jacket', price: 12000, imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', rating: 4.8, tag: 'Auctioned Item', isLive: true },
      { id: 'p5', name: 'Signed DVD Collection', price: 3500, imageUri: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80', rating: 4.7, tag: 'For Sale', isLive: false },
    ],
  },
  '3': {
    name: 'Kathryn Bernardo', type: 'Celebrity', isCelebrity: true, isVerified: true,
    followers: '17.4M', following: '204', rating: 4.9,
    avatarUri: 'https://www.famousbirthdays.com/faces/bernardo-kathryn-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    bio: 'Dream big, work hard, stay humble.',
    about: "Kathryn Chandria Manuel Bernardo (born March 26, 1996 in San Jose, Camarines Sur) is a multi-awarded Filipino actress, model, and brand ambassador, widely known as the 'Star for All Seasons' and 'Phenomenal Star.'\n\nOne of the highest-paid actresses in the Philippines, Kathryn has headlined blockbuster films and top-rating ABS-CBN series. Her love team with Daniel Padilla (KathNiel) became one of the most iconic pairings in Philippine showbiz history.",
    advocacy: { title: 'Empowering the Youth', intro: "Kathryn Bernardo actively uses her influence to uplift Filipino communities:", items: [
      { label: 'Youth Education', desc: 'Partners with educational NGOs to provide school supplies and scholarships to underserved students across the provinces.' },
      { label: 'Mental Health', desc: 'Advocates openly for mental health awareness, breaking stigmas through her social media platforms reaching 16M+ followers.' },
      { label: 'Disaster Relief', desc: 'Regularly leads relief operations and donation drives for typhoon victims in the Visayas and Luzon.' },
    ]},
    lifestyle: { title: "Phenomenal Star's Lifestyle", body: "From Camarines Sur to the biggest screens in the country — Kathryn Bernardo proves that hard work and humility are the true markers of a star." },
    posts: [
      { id: 'post5', author: 'Kathryn Bernardo', handle: '@bernardokath', timeAgo: '1 week', text: 'Sharing some of my personal fashion favorites from my film projects. All items authenticated! 💕', images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80'], likes: 389, comments: 114 },
    ],
    gallery: ['https://www.famousbirthdays.com/faces/bernardo-kathryn-image.jpg', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80', 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=400&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80'],
    products: [
      { id: 'p10', name: 'Film Premiere Gown', price: 18500, imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: true },
      { id: 'p11', name: 'Luxury Handbag', price: 14000, imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80', rating: 4.9, tag: 'Auctioned Item', isLive: true },
      { id: 'p12', name: 'KathNiel Collab Bracelet', price: 2800, imageUri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80', rating: 5.0, tag: 'For Sale', isLive: false },
    ],
  },
  '4': {
    name: 'Mimiyuuuh', type: 'Influencer', isCelebrity: true, isVerified: true,
    followers: '8.1M', following: '512', rating: 4.7,
    avatarUri: 'https://www.famousbirthdays.com/faces/mimiyuuuh-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80',
    bio: "Be yourself — everyone else is already taken.",
    about: "Mark Balmaceda Viernes, known online as Mimiyuuuh, is a Bisaya content creator, fashionista, and social media personality from Cebu who has become one of the Philippines' biggest YouTube stars.\n\nWith over 8 million YouTube subscribers, Mimiyuuuh is celebrated for his comedic style, fashion-forward content, and bold personality. He has collaborated with major brands and appeared on national TV, proving that authenticity and creativity have no limits.",
    advocacy: { title: 'Cebuano Pride & Inclusion', intro: "Mimiyuuuh champions creativity, inclusion, and Bisaya pride:", items: [
      { label: 'LGBTQ+ Visibility', desc: 'Openly advocates for LGBTQ+ acceptance, using his platform to normalize self-expression and diversity.' },
      { label: 'Support Local', desc: 'Actively promotes local Filipino designers and Cebuano artisans through his fashion content.' },
    ]},
    lifestyle: { title: "Creator's Lifestyle", body: "From Cebu to the world — Mimiyuuuh proves that unapologetic authenticity is the best content strategy." },
    posts: [{ id: 'post4', author: 'Mimiyuuuh', handle: '@mimiyuuuh', timeAgo: '4 days', text: 'Dropping my iconic lewks from my biggest YouTube videos! 100% authenticated by yurrr girl! 💅', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80'], likes: 187, comments: 54 }],
    gallery: ['https://www.famousbirthdays.com/faces/mimiyuuuh-image.jpg', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80'],
    products: [
      { id: 'p7', name: 'Viral YouTube Outfit', price: 6500, imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', rating: 4.8, tag: 'Auctioned Item', isLive: true },
      { id: 'p8', name: 'Limited Collab Sneakers', price: 4200, imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', rating: 4.7, tag: 'For Sale', isLive: false },
    ],
  },
  '5': {
    name: 'Ivana Alawi', type: 'Celebrity', isCelebrity: true, isVerified: true,
    followers: '19.3M', following: '178', rating: 5.0,
    avatarUri: 'https://www.famousbirthdays.com/faces/alawi-ivana-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
    bio: 'Grateful for every like, every view, and every LUVLOTS find.',
    about: "Ivana Aguilar Alawi (born March 27, 1997) is a Filipino-Moroccan actress, vlogger, model, and one of the Philippines' most-subscribed YouTube creators with over 16 million subscribers.\n\nRaised in the Philippines, Ivana began her career as an actress before pivoting to YouTube where her vlogs, challenges, and beauty content exploded in popularity. She has appeared in ABS-CBN films and series and is a sought-after brand ambassador for major lifestyle and beauty brands.",
    advocacy: { title: 'Family & Community First', intro: "Ivana Alawi's advocacy is deeply rooted in her love for family and community:", items: [
      { label: 'Alawi Foundation', desc: 'Co-founded by her family to support underprivileged communities in Manila with food, education, and livelihood programs.' },
      { label: 'Women Empowerment', desc: 'Promotes body confidence and financial independence for Filipina women through her content and brand partnerships.' },
      { label: 'Youth Creators', desc: 'Mentors young Filipino content creators, sharing knowledge about brand partnerships and digital careers.' },
    ]},
    lifestyle: { title: "Vlogger Queen's Lifestyle", body: "From her family's humble beginnings to 16M subscribers — Ivana Alawi's story is the ultimate Pinay glow-up." },
    posts: [
      { id: 'post5', author: 'Ivana Alawi', handle: '@ivanaalawi', timeAgo: '2 days', text: 'Selling some of my personal collection! These are pieces I actually wore in my vlogs 💖', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80'], likes: 521, comments: 143 },
    ],
    gallery: ['https://www.famousbirthdays.com/faces/alawi-ivana-image.jpg', 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=400&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80'],
    products: [
      { id: 'p13', name: 'Vlog Outfit Set', price: 8900, imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: true },
      { id: 'p14', name: 'Diamond Ring', price: 45000, imageUri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: true },
      { id: 'p15', name: 'Luxury Perfume Set', price: 5500, imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
    ],
  },
  '6': {
    name: 'Bretman Rock', type: 'Influencer', isCelebrity: true, isVerified: true,
    followers: '18.7M', following: '421', rating: 4.8,
    avatarUri: 'https://www.famousbirthdays.com/faces/rock-bretman-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    bio: 'I am not just a beauty guru — I am a BRAND.',
    about: "Bretman Cabudol Sacayanan (born July 31, 1998 in Sanchez-Mira, Cagayan, Philippines) is a Filipino-American beauty influencer, content creator, and TV personality based in Honolulu, Hawaii.\n\nKnown for his sharp wit, no-filter humor, and incredible makeup skills, Bretman Rock boasts over 18 million Instagram followers and 9 million YouTube subscribers. He appeared in MTV's reality show Following: Bretman Rock and has collaborated with global brands including H&M, Playboy, and MAC Cosmetics.",
    advocacy: { title: 'Roots & Representation', intro: "Bretman Rock proudly carries his Filipino identity on the world stage:", items: [
      { label: 'Philippine Pride', desc: 'Consistently champions Filipino culture and identity on global platforms, wearing Filipino brands and speaking Tagalog and Ilocano.' },
      { label: 'LGBTQ+ Advocacy', desc: 'A fearless voice for LGBTQ+ rights and self-expression, inspiring millions of young Filipinos to live authentically.' },
      { label: 'Cagayan Outreach', desc: 'Supports relief and livelihood programs in Cagayan, his home province, particularly after typhoon devastation.' },
    ]},
    lifestyle: { title: "Global Influencer's Lifestyle", body: "From Cagayan to the cover of Playboy — Bretman Rock is proof that a Filipino boy from the province can take over the world." },
    posts: [{ id: 'post6', author: 'Bretman Rock', handle: '@bretmanrock', timeAgo: '5 days', text: "Sis, I'm cleaning out my beauty vault! All authenticated, all iconic, all BRETMAN. 💄", images: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80'], likes: 634, comments: 189 }],
    gallery: ['https://www.famousbirthdays.com/faces/rock-bretman-image.jpg', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'],
    products: [
      { id: 'p16', name: 'Signed MAC Collab Palette', price: 7800, imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80', rating: 4.8, tag: 'Auctioned Item', isLive: false },
      { id: 'p17', name: 'Designer Sunglasses', price: 5200, imageUri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
    ],
  },
  '7': {
    name: 'Alex Gonzaga', type: 'Celebrity', isCelebrity: true, isVerified: true,
    followers: '12.4M', following: '98', rating: 4.7,
    avatarUri: 'https://www.famousbirthdays.com/faces/gonzaga-alex-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    bio: "Life is too short not to have fun — so have a lot of it!",
    about: "Alexandra Gonzaga (born September 16, 1988 in Manila) is a Filipino actress, TV host, YouTube vlogger, and comedian, and the younger sister of celebrity Toni Gonzaga-Soriano.\n\nWith over 12 million YouTube subscribers, Alex Gonzaga has become one of the top content creators in the Philippines. Known for her hilarious family vlogs, prank videos, and candid humor, she hosts television programs and stars in films while maintaining one of the most authentic personalities in Philippine entertainment.",
    advocacy: { title: 'Faith & Family Values', intro: "Alex Gonzaga's advocacy centers on faith, family, and lifting others:", items: [
      { label: 'Batangas Outreach', desc: 'Actively supports communities in Batangas through the Gonzaga family foundation, particularly after the Taal Volcano eruption.' },
      { label: 'Youth Inspiration', desc: 'Creates content that encourages young Filipinos to find joy in the everyday and remain grounded in family values.' },
    ]},
    lifestyle: { title: "Vlogger Star's Lifestyle", body: "From ABS-CBN sets to her family vlog — Alex Gonzaga shows the Philippines that real is always more relatable than perfect." },
    posts: [{ id: 'post7', author: 'Alex Gonzaga', handle: '@alexgonzaga', timeAgo: '1 week', text: "Sis approved! Clearing out my fave pieces from my biggest vlog moments. Yung tipong authentic talaga! 😂", images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80'], likes: 271, comments: 83 }],
    gallery: ['https://www.famousbirthdays.com/faces/gonzaga-alex-image.jpg', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80'],
    products: [
      { id: 'p18', name: 'Vlog Prank Outfit', price: 4500, imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', rating: 4.6, tag: 'For Sale', isLive: false },
      { id: 'p19', name: 'Signed Photo Book', price: 2200, imageUri: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80', rating: 4.7, tag: 'Auctioned Item', isLive: false },
    ],
  },
  '8': {
    name: 'Donnalyn Bartolome', type: 'Influencer', isCelebrity: true, isVerified: true,
    followers: '8.6M', following: '267', rating: 4.6,
    avatarUri: 'https://www.famousbirthdays.com/faces/bartolome-donnalyn-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
    bio: 'Singing my way through life, one vlog at a time.',
    about: "Donna Lynn Bartolome (born July 17, 1994 in Pasig City) is a Filipino singer, actress, and YouTube content creator who has built a massive following across platforms.\n\nKnown as the 'Queen of YouTube Philippines' in her early career, Donnalyn has over 8 million YouTube subscribers and has released original music that resonated with Filipino youth. She continues to create content, release music, and inspire her fanbase with her authentic and relatable personality.",
    advocacy: null, lifestyle: { title: "Creator & Singer's Lifestyle", body: "Donnalyn Bartolome proves you can do it all — sing, vlog, act, and stay true to yourself through it all." },
    posts: [{ id: 'post8', author: 'Donnalyn Bartolome', handle: '@donnalynbartolome', timeAgo: '3 days', text: 'Pre-loved items from my music video shoots and live events! Check them out 🎵', images: ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&q=80'], likes: 142, comments: 39 }],
    gallery: ['https://www.famousbirthdays.com/faces/bartolome-donnalyn-image.jpg', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'],
    products: [
      { id: 'p20', name: 'Music Video Jacket', price: 3800, imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80', rating: 4.5, tag: 'For Sale', isLive: false },
      { id: 'p21', name: 'Signed Debut Album', price: 1500, imageUri: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80', rating: 4.6, tag: 'Auctioned Item', isLive: false },
    ],
  },
  // ── Designers ──
  'd1': {
    name: 'Rajo Laurel', type: 'Designer', isCelebrity: false, isVerified: true,
    followers: '340K', following: '218', rating: 5.0,
    avatarUri: 'https://www.famousbirthdays.com/faces/laurel-rajo-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    bio: 'Fashion is my art. The Filipino woman is my muse.',
    about: "Rajo Laurel is one of the Philippines' most celebrated and awarded fashion designers, known for his contemporary take on Filipino femininity. With over two decades in the industry, his work has graced the red carpets of Manila's most prestigious events and earned him international recognition.\n\nA proud champion of Filipino craftsmanship, Rajo regularly incorporates indigenous textiles such as piña, jusi, and abel into his designs, helping bring traditional Filipino weaving into modern luxury fashion.",
    advocacy: { title: 'Championing Filipino Craftsmanship', intro: 'Rajo Laurel believes fashion can drive social change:', items: [
      { label: 'Slow Fashion', desc: 'Advocates for intentional, high-quality fashion over fast fashion, promoting pieces meant to last a lifetime.' },
      { label: 'Weaving Communities', desc: 'Partners with indigenous weaving communities in the Visayas and Luzon to bring their textiles to global audiences.' },
      { label: 'Emerging Designers', desc: 'Mentors the next generation of Filipino designers through workshops, apprenticeships, and industry collaborations.' },
    ]},
    lifestyle: { title: "Designer's World", body: "Between his flagship studio in Manila and fashion weeks across Asia, Rajo Laurel creates pieces that are unmistakably Filipino and undeniably world-class." },
    posts: [
      { id: 'rd1', author: 'Rajo Laurel', handle: '@rajolaurel', timeAgo: '3 days', text: 'Releasing a curated selection of archive pieces from my most iconic collections. Each piece comes with a certificate of authenticity. ✨', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80'], likes: 312, comments: 74 },
    ],
    gallery: ['https://www.famousbirthdays.com/faces/laurel-rajo-image.jpg', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80'],
    products: [
      { id: 'rd_p1', name: 'Archive Evening Gown', price: 38000, imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: true },
      { id: 'rd_p2', name: 'Piña Fiber Terno', price: 55000, imageUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: false },
      { id: 'rd_p3', name: 'Barong Tagalog (Bespoke)', price: 22000, imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
    ],
  },
  'd2': {
    name: 'Josie Natori', type: 'Designer', isCelebrity: false, isVerified: true,
    followers: '215K', following: '143', rating: 4.9,
    avatarUri: 'https://www.famousbirthdays.com/faces/natori-josie-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    bio: 'I wanted to make beautiful things people could wear every day.',
    about: "Josie Cruz Natori (born May 9, 1947 in Manila) is a Filipina-American fashion designer and businesswoman who founded The Natori Company in New York in 1977, originally as a lingerie business before expanding into a full luxury lifestyle brand.\n\nA former Wall Street executive, Josie broke barriers as a Filipina woman in both finance and fashion. Her brand, which carries her name and the Josie sub-line, is sold in over 50 countries and is known for its elegant Asian-inspired sensibility blended with American luxury.",
    advocacy: { title: 'Bridging East and West', intro: 'Josie Natori has always used her platform to elevate Filipino identity:', items: [
      { label: 'Natori Foundation', desc: 'Supports scholarships and cultural preservation programs in the Philippines, including programs for indigenous artisans.' },
      { label: 'Women in Business', desc: 'A trailblazer for women in both finance and fashion, Josie actively mentors Filipina entrepreneurs globally.' },
      { label: 'Philippine Artisans', desc: 'The Natori Company sources Filipino embroidery and craft work, directly supporting artisan communities in the Philippines.' },
    ]},
    lifestyle: { title: "Pioneer's Legacy", body: "From the boardrooms of Wall Street to the runways of New York — Josie Natori is the ultimate Filipina who conquered the world on her own terms." },
    posts: [
      { id: 'jn1', author: 'Josie Natori', handle: '@josienatori', timeAgo: '1 week', text: 'A rare opportunity to own pieces from our archive collections — each one a chapter in the Natori story. 🌸', images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80'], likes: 198, comments: 42 },
    ],
    gallery: ['https://www.famousbirthdays.com/faces/natori-josie-image.jpg', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80'],
    products: [
      { id: 'jn_p1', name: 'Natori Silk Robe (Archive)', price: 28000, imageUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80', rating: 5.0, tag: 'For Sale', isLive: false },
      { id: 'jn_p2', name: 'Embroidered Evening Jacket', price: 42000, imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', rating: 4.9, tag: 'Auctioned Item', isLive: false },
    ],
  },
  'd3': {
    name: 'Monique Lhuillier', type: 'Designer', isCelebrity: false, isVerified: true,
    followers: '592K', following: '87', rating: 5.0,
    avatarUri: 'https://www.famousbirthdays.com/faces/lhuillier-monique-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    bio: 'I design for the woman who wants to feel like the best version of herself.',
    about: "Monique Lhuillier (born September 15, 1971 in Cebu City, Philippines) is a Filipina-American fashion designer based in Los Angeles, best known for her romantic, ethereal bridal and eveningwear collections.\n\nSince founding her label in 1996, Monique has become the go-to designer for Hollywood's most iconic moments. Her gowns have been worn by Taylor Swift, Emma Stone, Reese Witherspoon, and members of international royalty. She is widely regarded as one of the most influential bridal designers of the 21st century.",
    advocacy: { title: 'Filipina Pride, Global Stage', intro: 'Monique Lhuillier carries the Philippines proudly on the world stage:', items: [
      { label: 'Arts Education', desc: 'Supports arts and fashion education programs in the Philippines and the United States through charitable giving and mentorship.' },
      { label: 'Sustainable Bridal', desc: 'Exploring heirloom-quality craftsmanship in bridal wear — gowns designed to be preserved, passed down, and re-worn.' },
      { label: 'Filipino Representation', desc: 'Consistently credits her Filipino heritage as the cornerstone of her aesthetic — beauty, romance, and meticulous craftsmanship.' },
    ]},
    lifestyle: { title: "Dream-Maker's World", body: "From Cebu to the Emmys red carpet — Monique Lhuillier has built an empire on the belief that every woman deserves to feel extraordinary." },
    posts: [
      { id: 'ml1', author: 'Monique Lhuillier', handle: '@moniquelhuillier', timeAgo: '5 days', text: 'Offering a selection of authenticated sample and archive gowns from our most beloved collections. Each piece is a wearable work of art. 🤍', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80'], likes: 541, comments: 128 },
    ],
    gallery: ['https://www.famousbirthdays.com/faces/lhuillier-monique-image.jpg', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=400&q=80'],
    products: [
      { id: 'ml_p1', name: 'Archive Bridal Gown', price: 185000, imageUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: true },
      { id: 'ml_p2', name: 'Red Carpet Evening Gown', price: 120000, imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: false },
      { id: 'ml_p3', name: 'Embroidered Cocktail Dress', price: 68000, imageUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
    ],
  },
  'd4': {
    name: 'Patis Tesoro', type: 'Designer', isCelebrity: false, isVerified: true,
    followers: '148K', following: '95', rating: 4.8,
    avatarUri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
    bio: 'Our heritage is our greatest luxury. Wear it with pride.',
    about: "Pacita 'Patis' Tesoro is a pioneering Filipino fashion designer, collector, and cultural advocate who has dedicated her career to preserving and celebrating the richness of traditional Filipino textiles and craftsmanship.\n\nHer boutique in Malate, Manila — one of the Philippines' most storied fashion institutions — has been a sanctuary for indigenous Filipino fabrics including piña, jusi, pineapple silk, and handwoven regional textiles for over four decades. She is widely regarded as the foremost authority on Philippine ethnic fashion.",
    advocacy: { title: 'Preserving Philippine Heritage', intro: "Patis Tesoro is the Philippines' foremost guardian of indigenous fashion heritage:", items: [
      { label: "Weavers' Livelihood", desc: 'Directly supports hundreds of indigenous weavers across Mindanao, Visayas, and Luzon by purchasing their work at fair prices and giving it global visibility.' },
      { label: 'Cultural Documentation', desc: 'Has spent decades documenting traditional Filipino textile traditions and archiving garments that would otherwise be lost to history.' },
      { label: 'Terno Preservation', desc: 'Championed the revival of the terno and other traditional Filipino formal wear, bringing them back to national prominence.' },
    ]},
    lifestyle: { title: "The Keeper of Filipino Fashion", body: "Patis Tesoro's life is the living archive of Philippine fashion — every piece she creates or curates is a love letter to the Filipino people." },
    posts: [
      { id: 'pt1', author: 'Patis Tesoro', handle: '@patistesoro', timeAgo: '2 weeks', text: 'From our archive: rare piña fiber pieces and vintage ternos from the 1970s–1990s. These are irreplaceable pieces of Philippine history. 🌿', images: ['https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&q=80'], likes: 267, comments: 91 },
    ],
    gallery: ['https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80'],
    products: [
      { id: 'pt_p1', name: 'Vintage Piña Terno (1980s)', price: 95000, imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: false },
      { id: 'pt_p2', name: 'Handwoven Mindanao Shawl', price: 12000, imageUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
      { id: 'pt_p3', name: 'Jusi Barong (Archive)', price: 38000, imageUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80', rating: 4.8, tag: 'For Sale', isLive: false },
    ],
  },
  'd5': {
    name: 'Avel Bacudio', type: 'Designer', isCelebrity: false, isVerified: true,
    followers: '102K', following: '310', rating: 4.7,
    avatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    bio: 'I dress Filipinas for the moments that matter most.',
    about: "Avel Bacudio is a celebrated Filipino fashion designer known for his mastery of couture evening and bridal wear. His atelier in Manila has become one of the most sought-after in the country, dressing major celebrities for awards shows, film premieres, and pageants.\n\nWith a distinct aesthetic that blends classic European couture techniques with Filipino sensibility, Avel has dressed some of the country's biggest stars for their most iconic fashion moments, earning him a reputation as the craftsman of dreams.",
    advocacy: { title: 'Filipino Artisanship First', intro: 'Avel Bacudio champions the skilled hands behind every gown:', items: [
      { label: 'Atelyer Workforce', desc: 'Employs and trains Filipino seamstresses and embroiderers, preserving couture hand-craft skills that are increasingly rare.' },
      { label: 'Made in the Philippines', desc: 'Every piece is designed and made entirely in the Philippines, advocating for local production and craftsmanship over fast fashion.' },
    ]},
    lifestyle: { title: "The Atelier Life", body: "Behind every red-carpet moment Avel Bacudio has created is hundreds of hours of meticulous hand-work by Filipino artisans — fashion as culture, not just clothing." },
    posts: [
      { id: 'ab1', author: 'Avel Bacudio', handle: '@avelbacudio', timeAgo: '1 week', text: 'Sample collection pieces now available — each worn by Filipino stars at major events. Certificate of authenticity included. 🤍', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80'], likes: 189, comments: 47 },
    ],
    gallery: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=400&q=80'],
    products: [
      { id: 'ab_p1', name: 'Awards Night Gown', price: 65000, imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', rating: 4.9, tag: 'Auctioned Item', isLive: false },
      { id: 'ab_p2', name: 'Beaded Cocktail Dress', price: 28000, imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=300&q=80', rating: 4.7, tag: 'For Sale', isLive: false },
    ],
  },
  // ── Sustainable Brands ──
  's1': {
    name: 'Verde Collective', type: 'Sustainable Brand', isCelebrity: false, isVerified: true,
    followers: '91K', following: '412', rating: 4.9,
    avatarUri: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
    bio: 'Style that doesn\'t cost the earth.',
    about: "Verde Collective is a Philippine-based sustainable fashion brand committed to creating contemporary clothing from upcycled, deadstock, and natural materials sourced ethically within the country.\n\nFounded by a collective of Filipino creatives, Verde partners with local weavers, dyers, and tailors to produce limited-run, zero-waste collections. Each piece is traceable to its source — from the raw material to the hands that made it.",
    advocacy: { title: 'Zero-Waste Fashion', intro: 'Verde Collective is built entirely around sustainable practice:', items: [
      { label: 'Deadstock Materials', desc: 'Sources all fabrics from textile industry deadstock, preventing them from ending up in landfills and giving them a second life.' },
      { label: 'Fair Wage Partnerships', desc: 'Every maker in the Verde supply chain earns a certified living wage, with full transparency published on their website.' },
      { label: 'Take-Back Program', desc: 'Customers can return Verde pieces at end-of-life for upcycling into new collections — a true closed-loop fashion system.' },
    ]},
    lifestyle: { title: "Conscious Living", body: "Verde Collective exists at the intersection of beauty and responsibility — proving that the most stylish choice is always the most sustainable one." },
    posts: [
      { id: 'vc1', author: 'Verde Collective', handle: '@verdecollective', timeAgo: '2 days', text: 'Our pre-loved section is now live on LUVLOTS! Each piece has been worn with love and is ready for its next chapter. 🌿', images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80'], likes: 143, comments: 38 },
    ],
    gallery: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80'],
    products: [
      { id: 'vc_p1', name: 'Upcycled Linen Jacket', price: 3800, imageUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
      { id: 'vc_p2', name: 'Deadstock Silk Blouse', price: 2400, imageUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80', rating: 4.8, tag: 'For Sale', isLive: false },
    ],
  },
  's2': {
    name: 'Hiraya PH', type: 'Sustainable Brand', isCelebrity: false, isVerified: true,
    followers: '128K', following: '287', rating: 4.8,
    avatarUri: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80',
    bio: 'Hiraya — from the Filipino word for the fruit of one\'s dreams.',
    about: "Hiraya PH is a beloved Filipino fashion brand known for its minimalist, thoughtfully constructed pieces that celebrate Filipino craftsmanship without compromise. The brand's name — from the Filipino word meaning 'the fruit of one's dreams' — reflects its founding philosophy: that beautiful, well-made clothing is accessible to all.\n\nHiraya produces its collections in small batches to minimize waste and works exclusively with Filipino fabric suppliers and garment workers, ensuring every peso spent supports the local fashion ecosystem.",
    advocacy: { title: 'Dream It, Wear It, Live It', intro: 'Hiraya PH is committed to a more intentional fashion culture:', items: [
      { label: 'Small-Batch Production', desc: 'Every Hiraya collection is produced in limited quantities to prevent overproduction and reduce waste at every stage.' },
      { label: 'Filipino Fabric First', desc: 'Sources 100% of its materials from Philippine suppliers, supporting the local textile industry from fiber to finished garment.' },
      { label: 'Size Inclusivity', desc: 'Offers an extended size range across all collections, ensuring that beautiful, well-made fashion is accessible to every body.' },
    ]},
    lifestyle: { title: "Everyday Elegance", body: "Hiraya PH is for the Filipino who values beauty in simplicity — clothing that works as hard as they do and lasts as long as their dreams." },
    posts: [
      { id: 'hp1', author: 'Hiraya PH', handle: '@hirayaph', timeAgo: '4 days', text: 'Our pre-loved pieces have been authenticated and are ready to find their forever home. Slow fashion lives here. 🌸', images: ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&q=80'], likes: 218, comments: 56 },
    ],
    gallery: ['https://images.unsplash.com/photo-1556760544-74068565f05c?w=400&q=80', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80'],
    products: [
      { id: 'hp_p1', name: 'Classic Linen Co-ord Set', price: 2800, imageUri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&q=80', rating: 4.8, tag: 'For Sale', isLive: false },
      { id: 'hp_p2', name: 'Hand-Dyed Cotton Dress', price: 1900, imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
    ],
  },
  's3': {
    name: 'Anthill Fabric Gallery', type: 'Sustainable Brand', isCelebrity: false, isVerified: true,
    followers: '71K', following: '189', rating: 4.9,
    avatarUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
    bio: 'Every thread tells the story of a community.',
    about: "Anthill Fabric Gallery is an award-winning Cebu-based social enterprise founded in 2010 by Anya Lim and Adrienne Dy. It bridges the gap between upland weaving communities in the Visayas and Mindanao with contemporary fashion consumers who value authenticity and heritage.\n\nAnthill works directly with indigenous weavers — including communities from T'boli, Maranao, Bagobo, and Mandaya traditions — incorporating their handwoven fabrics into modern, wearable designs. The brand has been recognized internationally as a model of ethical, community-centered fashion.",
    advocacy: { title: 'Weaving Communities Forward', intro: "Anthill Fabric Gallery's entire business model is an act of advocacy:", items: [
      { label: 'Direct Weaver Partnerships', desc: 'Works directly with 12+ indigenous weaving communities, paying above-market rates and providing design training and stable income.' },
      { label: 'Heritage Documentation', desc: 'Documents traditional weaving patterns, dyes, and techniques to ensure they are preserved for future generations.' },
      { label: 'Global Visibility', desc: 'Has brought Philippine indigenous textiles to international fashion weeks, design fairs, and museums, elevating their cultural value.' },
    ]},
    lifestyle: { title: "Stories Woven in Thread", body: "Every Anthill piece carries the fingerprints of the communities that made it — buy one, and you're part of a story stretching back centuries." },
    posts: [
      { id: 'af1', author: 'Anthill Fabric Gallery', handle: '@anthillfabric', timeAgo: '1 week', text: 'Pre-loved Anthill pieces — each one a collaboration between our design team and indigenous weavers across the Philippines. 🧵', images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80'], likes: 312, comments: 87 },
    ],
    gallery: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80'],
    products: [
      { id: 'af_p1', name: "T'nalak Woven Jacket", price: 6800, imageUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80', rating: 5.0, tag: 'For Sale', isLive: false },
      { id: 'af_p2', name: 'Maranao Malong Wrap Skirt', price: 3200, imageUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
      { id: 'af_p3', name: 'Inabel Loom-Woven Blouse', price: 4500, imageUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80', rating: 5.0, tag: 'Auctioned Item', isLive: false },
    ],
  },
  's4': {
    name: 'Niyog Studio', type: 'Sustainable Brand', isCelebrity: false, isVerified: true,
    followers: '46K', following: '231', rating: 4.7,
    avatarUri: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    bio: 'Born from the coconut palm. Built for the modern Filipino.',
    about: "Niyog Studio is a Manila-based sustainable fashion label that takes its name and inspiration from the coconut palm (niyog) — the Philippines' most versatile and abundant natural resource.\n\nThe brand pioneered the use of coco-coir fabric, coconut shell buttons, and natural coconut-derived dyes in contemporary Filipino fashion. Every collection is designed to be compostable, biodegradable, or upcyclable, with production partnering exclusively with cooperatives in Quezon Province.",
    advocacy: { title: 'Nature as Material', intro: 'Niyog Studio treats every tree and fiber as a collaborator:', items: [
      { label: 'Coconut-Derived Materials', desc: 'Sources and develops fabrics, buttons, and accessories from the coconut plant — one of the most renewable resources in the Philippines.' },
      { label: 'Quezon Cooperative', desc: 'All production is done through a women-led cooperative in Quezon Province, providing stable employment in a rural community.' },
      { label: 'Compostable Packaging', desc: 'Ships all orders in 100% compostable, plant-based packaging — zero plastic in the entire supply chain.' },
    ]},
    lifestyle: { title: "Back to Roots", body: "Niyog Studio is for the Filipino who wants their clothing to tell an honest story — rooted in the land, made by hand, worn with purpose." },
    posts: [
      { id: 'ns1', author: 'Niyog Studio', handle: '@niyogstudio', timeAgo: '3 days', text: 'Our pre-loved pieces find a second home here. Every purchase keeps a coconut-fiber garment out of a landfill. 🌴', images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80'], likes: 98, comments: 27 },
    ],
    gallery: ['https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80'],
    products: [
      { id: 'ns_p1', name: 'Coco-Fiber Everyday Tee', price: 1200, imageUri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80', rating: 4.7, tag: 'For Sale', isLive: false },
      { id: 'ns_p2', name: 'Natural-Dye Wrap Trousers', price: 2800, imageUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80', rating: 4.8, tag: 'For Sale', isLive: false },
    ],
  },
  's5': {
    name: 'LIKHÂ', type: 'Sustainable Brand', isCelebrity: false, isVerified: true,
    followers: '58K', following: '176', rating: 4.8,
    avatarUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    bio: 'Likhâ — to create. That is everything we are.',
    about: "LIKHÂ (from the Filipino word meaning 'to create') is a social enterprise and fashion brand based in Pampanga that works with skilled artisan communities across the Philippines to produce handcrafted bags, accessories, and clothing.\n\nEach LIKHÂ piece is made by hand using traditional Filipino craft techniques — including macramé, rattan weaving, shell inlay, and embroidery — and is sold under a fair trade model that ensures artisans receive a living wage and credit for their work.",
    advocacy: { title: 'Artisan at the Center', intro: 'LIKHÂ was founded on a simple belief: the maker deserves the spotlight:', items: [
      { label: 'Fair Trade Certified', desc: 'All LIKHÂ products are produced under fair trade principles, with artisans receiving living wages, health benefits, and production credits.' },
      { label: 'Traditional Craft Revival', desc: 'Actively revives dying Filipino craft traditions — from Cordillera basket-weaving to Pampanga embroidery — by making them commercially viable.' },
      { label: 'Women Artisans', desc: '87% of LIKHÂ\'s artisan partners are women, and the enterprise provides childcare and flexible work arrangements to support them.' },
    ]},
    lifestyle: { title: "Made with Meaning", body: "LIKHÂ is more than a brand — it's a movement to put Filipino artisans at the center of the global fashion conversation, one handmade piece at a time." },
    posts: [
      { id: 'lk1', author: 'LIKHÂ', handle: '@likhacreates', timeAgo: '5 days', text: 'Pre-loved LIKHÂ pieces now on LUVLOTS — each one handmade by our artisan partners across the Philippines. When you buy pre-loved, you extend the life of their craft. 🤍', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80'], likes: 187, comments: 51 },
    ],
    gallery: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80'],
    products: [
      { id: 'lk_p1', name: 'Hand-Woven Rattan Bag', price: 3500, imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80', rating: 4.9, tag: 'For Sale', isLive: false },
      { id: 'lk_p2', name: 'Embroidered Capiz Clutch', price: 2200, imageUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&q=80', rating: 4.8, tag: 'For Sale', isLive: false },
      { id: 'lk_p3', name: 'Macramé Wall Piece', price: 1800, imageUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80', rating: 4.7, tag: 'For Sale', isLive: false },
    ],
  },
};

const DEFAULT_SELLER: any = {
  name: 'Seller', type: 'Seller', isCelebrity: false, isVerified: false,
  followers: '0', following: '0', rating: 0,
  avatarUri: 'https://randomuser.me/api/portraits/women/23.jpg',
  coverUri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80',
  bio: '', about: '', advocacy: null, lifestyle: null, posts: [], gallery: [], products: [],
};

type TabKey = 'about' | 'product' | 'followers' | 'following';

const PUBLIC_FIGURE_PROFILE_MAP: Record<string, string> = {
  pf1: '4',
  pf2: '6',
  pf3: '8',
  pf4: '1',
  pf5: '2',
  pf6: '3',
  pf7: '5',
  pf8: '7',
};

/* ─── Fan card config — wider spread ─── */
const FAN_CONFIG = [
  { rotate: '-12deg', translateX: -48, translateY: 18, zIndex: 1 },
  { rotate: '0deg',   translateX: 0,   translateY: 0,  zIndex: 3 },
  { rotate: '12deg',  translateX: 48,  translateY: 18, zIndex: 2 },
];

/* ─── Post Card ─── */
function PostCard({ post, avatarUri }: { post: any; avatarUri: string }) {
  return (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <Image source={{ uri: avatarUri }} style={s.postAvatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.postAuthor}>
            {post.author}{' '}
            <Text style={s.postHandle}>{post.handle} \u2022 {post.timeAgo}</Text>
          </Text>
        </View>
      </View>
      <Text style={s.postText}>{post.text}</Text>
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {post.images.map((img: string, i: number) => (
            <Image key={i} source={{ uri: img }} style={s.postImage} resizeMode="cover" />
          ))}
        </ScrollView>
      )}
      <View style={s.postActions}>
        <View style={s.postAction}>
          <ThumbsUp size={14} color="#4289AB" />
          <Text style={s.postActionText}>{post.likes}</Text>
        </View>
        <View style={s.postAction}>
          <MessageSquare size={14} color="#4289AB" />
          <Text style={s.postActionText}>{post.comments}</Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Product Card ─── */
function ProductItem({ product }: { product: any }) {
  return (
    <Pressable
      onPress={() => {
        if (product.isLive) {
          router.push({ pathname: '/(main)/LiveSellingScreen', params: { productId: product.id } } as any);
        } else {
          router.push('/(main)/BiddingScreen');
        }
      }}
      style={s.productCard}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: product.imageUri }} style={s.productImage} resizeMode="cover" />
        {product.isLive && (
          <View style={s.liveProductBadge}>
            <Radio size={10} color="#fff" />
            <Text style={s.liveProductText}>LIVE</Text>
          </View>
        )}
        {product.tag === 'Auctioned Item' && (
          <View style={s.auctionTagOverlay}>
            <Gavel size={9} color="#D9AC4E" />
            <Text style={s.auctionTagText}>Auction</Text>
          </View>
        )}
      </View>
      <View style={s.productInfo}>
        <Text style={s.productName} numberOfLines={1}>{product.name}</Text>
        <View style={s.productBottom}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Star size={11} color="#D9AC4E" fill="#D9AC4E" />
              <Text style={s.productRating}>{product.rating}</Text>
            </View>
          </View>
          <Text style={s.productPrice}>\u20B1{product.price.toFixed(2)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ─── Stacked Fan Gallery ─── */
function StackedGallery({ images, onExpand }: { images: string[]; onExpand: () => void }) {
  const fanImages = images.slice(0, 3);
  const scale = useSharedValue(1);

  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withSpring(0.93, { mass: 0.25, damping: 12 }),
      withSpring(1.04, { mass: 0.25, damping: 12 }),
      withSpring(1, { mass: 0.4, damping: 14 })
    );
    setTimeout(onExpand, 180);
  }

  return (
    <View style={s.gallerySection}>
      <View style={s.gallerySectionHeader}>
        <Text style={s.sectionTitle}>Photo Gallery</Text>
        <View style={s.photoCountPill}>
          <Text style={s.photoCountText}>{images.length} photos</Text>
        </View>
      </View>

      <Pressable onPress={handlePress}>
        <Animated2.View style={[s.fanContainer, containerAnimStyle]}>
          {fanImages.map((uri, i) => {
            const cfg = FAN_CONFIG[i] ?? FAN_CONFIG[1];
            return (
              <View
                key={i}
                style={[
                  s.fanCard,
                  {
                    transform: [
                      { rotate: cfg.rotate },
                      { translateX: cfg.translateX },
                      { translateY: cfg.translateY },
                    ],
                    zIndex: cfg.zIndex,
                  },
                ]}>
                <Image source={{ uri }} style={s.fanCardImage} resizeMode="cover" />
                {/* Subtle shimmer on back cards */}
                {i !== 1 && (
                  <View style={s.fanCardOverlay} />
                )}
              </View>
            );
          })}

          {/* Tap hint overlay on center card */}
          <View style={s.fanHint} pointerEvents="none">
            <ZoomIn size={15} color="#fff" />
            <Text style={s.fanHintText}>Tap to expand</Text>
          </View>
        </Animated2.View>
      </Pressable>
    </View>
  );
}

/* ─── Expanded Grid Gallery ─── */
function ExpandedGallery({
  images,
  onCollapse,
  expandAnim,
  onImagePress,
}: {
  images: string[];
  onCollapse: () => void;
  expandAnim: Animated.Value;
  onImagePress: (index: number) => void;
}) {
  const opacity = expandAnim;
  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Animated.View style={[s.gallerySection, { opacity, transform: [{ translateY }] }]}>
      <View style={s.gallerySectionHeader}>
        <Text style={s.sectionTitle}>Photo Gallery</Text>
        <Pressable onPress={onCollapse} style={s.collapseBtn}>
          <Text style={s.collapseBtnText}>Collapse</Text>
        </Pressable>
      </View>

      <View style={s.galleryGrid}>
        {images.map((uri: string, i: number) => (
          <Pressable key={i} style={s.galleryGridItem} onPress={() => onImagePress(i)}>
            <Image source={{ uri }} style={s.galleryGridImage} resizeMode="cover" />
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

/* ─── Main Screen ─── */
export default function SellerDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedId = PUBLIC_FIGURE_PROFILE_MAP[id ?? ''] ?? (id ?? '');
  const seller = SELLER_DATA[resolvedId] || DEFAULT_SELLER;
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  function handleShareSeller() {
    Share.share({
      message: `Check out ${seller.name}'s shop on luvlots! ${seller.followers} followers · ${seller.type}`,
      title: seller.name,
    });
  }
  const expandAnim = useRef(new Animated.Value(0)).current;

  const tabs: { key: TabKey; label: string; count?: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'product', label: 'Products', count: String(seller.products.length) },
    { key: 'followers', label: 'Followers', count: seller.followers },
    { key: 'following', label: 'Following', count: seller.following },
  ];

  function openModalAtIndex(index: number) {
    setSelectedImageIndex(index);
    setGalleryModalVisible(true);
  }

  function handleExpandGallery() {
    setGalleryExpanded(true);
    expandAnim.setValue(0);
    Animated.spring(expandAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }

  function handleCollapseGallery() {
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setGalleryExpanded(false));
  }

  function renderGallerySection() {
    const images: string[] = seller.gallery || [];
    if (images.length === 0) return null;

    if (galleryExpanded) {
      return (
        <ExpandedGallery
          images={images}
          onCollapse={handleCollapseGallery}
          expandAnim={expandAnim}
          onImagePress={openModalAtIndex}
        />
      );
    }

    return <StackedGallery images={images} onExpand={handleExpandGallery} />;
  }

  return (
    <LinearGradient
      colors={['#3A7CA5', '#4F9EC4', '#6DB8D8', '#8FCCE5']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* ─── Cover ─── */}
          <View style={s.coverWrap}>
            <Image source={{ uri: seller.coverUri }} style={s.coverImage} resizeMode="cover" />
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.45)']} locations={[0, 0.3, 1]} style={s.coverOverlay} />
            <View style={s.coverNav}>
              <Pressable onPress={() => router.back()} style={s.navBtn}>
                <ChevronLeft size={22} color="#fff" />
              </Pressable>
              <View style={s.navRight}>
                <Pressable style={s.navBtn}><Heart size={18} color="#fff" /></Pressable>
                <Pressable style={s.navBtn} onPress={handleShareSeller}><Share2 size={18} color="#fff" /></Pressable>
              </View>
            </View>
          </View>

          {/* ─── Profile Header ─── */}
          <View style={s.profileHeader}>
            <View style={s.avatarRow}>
              <View style={s.avatarWrap}>
                <Image source={{ uri: seller.avatarUri }} style={s.avatar} />
                {seller.isVerified && (
                  <View style={s.verifiedBadge}>
                    <CheckCircle2 size={16} color="#fff" fill="#4CAF50" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.sellerName}>{seller.name}</Text>
                <Text style={s.sellerType}>{seller.type}</Text>
              </View>
              <Pressable
                onPress={() => setIsFollowing(!isFollowing)}
                style={[s.followBtn, isFollowing && s.followBtnActive]}>
                <UserCheck size={14} color={isFollowing ? '#4289AB' : '#fff'} />
                <Text style={[s.followBtnText, isFollowing && s.followBtnTextActive]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>

            <Text style={s.bio}>{seller.bio}</Text>

            {/* Stats row */}
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{seller.followers}</Text>
                <Text style={s.statLabel}>Followers</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>{seller.following}</Text>
                <Text style={s.statLabel}>Following</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Star size={12} color="#D9AC4E" fill="#D9AC4E" />
                  <Text style={s.statValue}>{seller.rating}</Text>
                </View>
                <Text style={s.statLabel}>Rating</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>{seller.products.length}</Text>
                <Text style={s.statLabel}>Products</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={s.tagsRow}>
              {seller.isCelebrity && (
                <View style={s.tagCeleb}>
                  <Star size={11} color="#fff" fill="#fff" />
                  <Text style={s.tagCelebText}>Celebrity & Influencer</Text>
                </View>
              )}
              {seller.isVerified && (
                <View style={s.tagVerified}>
                  <CheckCircle2 size={11} color="#fff" />
                  <Text style={s.tagVerifiedText}>Verified Seller</Text>
                </View>
              )}
            </View>
          </View>

          {/* ─── Tab Bar ─── */}
          <Animated2.View entering={FadeInDown.delay(200).duration(500)} style={s.tabRow}>
            {tabs.map((tab) => (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}
                style={[s.tabItem, activeTab === tab.key && s.tabItemActive]}>
                <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]} numberOfLines={1}>{tab.label}</Text>
                {tab.count && (
                  <Text style={[s.tabCount, activeTab === tab.key && s.tabCountActive]} numberOfLines={1}>{tab.count}</Text>
                )}
              </Pressable>
            ))}
          </Animated2.View>

          {/* ─── Tab Content ─── */}
          <Animated2.View entering={FadeInDown.delay(300).duration(500)} style={s.tabContent}>
            {activeTab === 'about' && (
              <View>
                <Text style={s.sectionTitle}>About</Text>
                <Text style={s.sectionBody}>{seller.about}</Text>

                {seller.advocacy && (
                  <View style={s.advocacyCard}>
                    <View style={s.advocacyHeader}>
                      <ShoppingBag size={16} color="#4289AB" />
                      <Text style={s.advocacyTitle}>{seller.advocacy.title}</Text>
                    </View>
                    <Text style={s.sectionBody}>{seller.advocacy.intro}</Text>
                    {seller.advocacy.items.map((item: any, idx: number) => (
                      <View key={idx} style={s.advocacyItem}>
                        <View style={s.advocacyDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.advocacyLabel}>{item.label}</Text>
                          <Text style={s.advocacyDesc}>{item.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {seller.lifestyle && (
                  <View style={s.lifestyleCard}>
                    <Text style={s.lifestyleTitle}>{seller.lifestyle.title}</Text>
                    <Text style={s.lifestyleBody}>{seller.lifestyle.body}</Text>
                  </View>
                )}

                {seller.posts && seller.posts.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <Text style={s.sectionTitle}>Recent Posts</Text>
                    {seller.posts.map((post: any) => (
                      <PostCard key={post.id} post={post} avatarUri={seller.avatarUri} />
                    ))}
                  </View>
                )}

                {renderGallerySection()}
              </View>
            )}
            {activeTab === 'product' && (
              <View>
                <Text style={s.sectionTitle}>Products ({seller.products.length})</Text>
                {seller.products.length === 0 ? (
                  <Text style={s.placeholderText}>No products yet.</Text>
                ) : (
                  <View style={s.productGrid}>
                    {seller.products.map((p: any) => <ProductItem key={p.id} product={p} />)}
                  </View>
                )}
              </View>
            )}
            {activeTab === 'followers' && (
              <View>
                <Text style={s.sectionTitle}>Followers ({seller.followers})</Text>
                <Text style={s.placeholderText}>Followers list will appear here.</Text>
              </View>
            )}
            {activeTab === 'following' && (
              <View>
                <Text style={s.sectionTitle}>Following ({seller.following})</Text>
                <Text style={s.placeholderText}>Following list will appear here.</Text>
              </View>
            )}
          </Animated2.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ─── Fullscreen Gallery Modal ─── */}
      <RNModal
        visible={galleryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGalleryModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalTopBar, { paddingTop: insets.top + 12 }]}>
            <Text style={s.modalCounter}>
              {selectedImageIndex + 1} / {(seller.gallery || []).length}
            </Text>
            <Pressable onPress={() => setGalleryModalVisible(false)} style={s.modalCloseBtn}>
              <X size={22} color="#fff" />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedImageIndex * SCREEN_W, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setSelectedImageIndex(idx);
            }}
            style={{ flex: 1 }}>
            {(seller.gallery || []).map((uri: string, i: number) => (
              <View key={i} style={{ width: SCREEN_W, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri }}
                  style={{ width: SCREEN_W, height: SCREEN_W }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          <View style={[s.modalThumbStrip, { paddingBottom: insets.bottom + 12 }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
              {(seller.gallery || []).map((uri: string, i: number) => (
                <Pressable key={i} onPress={() => setSelectedImageIndex(i)}>
                  <Image
                    source={{ uri }}
                    style={[s.modalThumb, selectedImageIndex === i && s.modalThumbActive]}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </RNModal>
    </LinearGradient>
  );
}

const GALLERY_GRID_GAP = 8;
// tabContent has marginHorizontal:20 + padding:20 on each side = 80px total, plus 1 gap
const GALLERY_ITEM_W = (SCREEN_W - 80 - GALLERY_GRID_GAP) / 2;

const FAN_CARD_W = 170;
const FAN_CARD_H = 220;

const s = StyleSheet.create({
  /* ── Cover ── */
  coverWrap: { height: 200, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  coverNav: { position: 'absolute', top: 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  navBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  navRight: { flexDirection: 'row', gap: 10 },

  /* ── Profile Header ── */
  profileHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  sellerName: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#fff' },
  sellerType: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  followBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  followBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' },
  followBtnTextActive: { color: '#4289AB' },
  bio: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginTop: 12 },

  /* ── Stats ── */
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff' },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },

  /* ── Tags ── */
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  tagCeleb: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#D9AC4E', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagCelebText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#fff' },
  tagVerified: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#10B981', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagVerifiedText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#fff' },

  /* ── Tabs ── */
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  tabItemActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#3A7CA5' },
  tabCount: { fontFamily: 'Poppins_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  tabCountActive: { color: '#999' },

  /* ── Tab Content ── */
  tabContent: { marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#222', marginBottom: 8 },
  sectionBody: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#555', lineHeight: 21 },
  placeholderText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#999', marginTop: 4 },

  /* ── Advocacy ── */
  advocacyCard: { marginTop: 20, backgroundColor: '#F8FBFD', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E8F0F5' },
  advocacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  advocacyTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#222' },
  advocacyItem: { flexDirection: 'row', marginTop: 10, gap: 10 },
  advocacyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4289AB', marginTop: 7 },
  advocacyLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#333', marginBottom: 2 },
  advocacyDesc: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#666', lineHeight: 18 },

  /* ── Lifestyle ── */
  lifestyleCard: { marginTop: 16, backgroundColor: '#FFFBF0', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F5E6B8' },
  lifestyleTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#222', marginBottom: 6 },
  lifestyleBody: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#666', lineHeight: 20, fontStyle: 'italic' },

  /* ── Posts ── */
  postCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginTop: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  postAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB' },
  postAuthor: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#222' },
  postHandle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  postText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#444', lineHeight: 20, marginTop: 8 },
  postImage: { width: 140, height: 100, borderRadius: 10, marginRight: 8, backgroundColor: '#E5E7EB' },
  postActions: { flexDirection: 'row', gap: 20, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' },

  /* ── Stacked Fan Gallery ── */
  gallerySection: { marginTop: 24 },
  gallerySectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  photoCountPill: { backgroundColor: '#EFF6FA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  photoCountText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#4289AB' },

  fanContainer: {
    height: FAN_CARD_H + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanCard: {
    position: 'absolute',
    width: FAN_CARD_W,
    height: FAN_CARD_H,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fanCardImage: {
    width: '100%',
    height: '100%',
  },
  fanCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 14,
  },
  fanHint: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fanHintText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.3,
  },

  /* ── Collapse Button ── */
  collapseBtn: {
    backgroundColor: '#EFF6FA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  collapseBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#4289AB',
  },

  /* ── Expanded 2-column Grid ── */
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GALLERY_GRID_GAP,
  },
  galleryGridItem: {
    width: GALLERY_ITEM_W,
    height: GALLERY_ITEM_W,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryGridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },

  /* ── Products Grid ── */
  productGrid: { gap: 12, marginTop: 8 },
  productCard: { backgroundColor: '#F9FAFB', borderRadius: 14, overflow: 'hidden' },
  productImage: { width: '100%', height: 180, backgroundColor: '#E5E7EB' },
  liveProductBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E53935', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  liveProductText: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#fff', letterSpacing: 0.5 },
  auctionTagOverlay: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  auctionTagText: { fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: '#D9AC4E' },
  productInfo: { padding: 12 },
  productName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#222' },
  productBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 6 },
  productRating: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#666' },
  productPrice: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#222' },

  /* ── Gallery Modal ── */
  modalOverlay: { flex: 1, backgroundColor: '#000' },
  modalTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  modalCounter: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#fff' },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  modalThumbStrip: { paddingTop: 12, backgroundColor: 'rgba(0,0,0,0.8)' },
  modalThumb: { width: 52, height: 52, borderRadius: 8, borderWidth: 2, borderColor: 'transparent', backgroundColor: '#333' },
  modalThumbActive: { borderColor: '#4289AB' },
});

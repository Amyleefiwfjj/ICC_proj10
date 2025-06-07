let headerImg, img, tempTable, rainTable, font, gl;
let cities = [];
let currentIdx = 0;          // 0–11: month index, or 'avg'
const planeSize = 800;
let lang = 'ko', unit = 'C';
const API_KEY = '';          // OpenWeather API key if you want realtime data

// 자치도별 3D 위치
const regionCoords = {
    '경기도': { x: -60, z: -230 },
    '강원도': { x: 100, z: -230 },
    '충청북도': { x: 0, z: -100 },
    '충청남도': { x: -100, z: -80 },
    '전라북도': { x: -80, z: 20 },
    '전라남도': { x: -100, z: 130 },
    '경상북도': { x: 180, z: -70 },
    '경상남도': { x: 120, z: 70 },
    '제주특별자치도': { x: -160, z: 300 }
};

// 다국어 레이블
const I18N = {
    ko: { avg: '평균', feels: '체감', rain: '강수', uv: '자외선', prep: '추천 관광지' },
    en: { avg: 'Avg', feels: 'Feels', rain: 'Rain', uv: 'UV', prep: 'recommendation' }
};
const attractions = {
    '경기도': {
        7: [
            { ko: '한국민속촌', en: 'Korean Folk Village' },
            { ko: '에버랜드 겨울왕국 축제', en: 'Everland Winter Fantasy Festival' }
        ],
        8: [
            { ko: 'DMZ 평화의 길', en: 'DMZ Peace Trail' },
            { ko: '헤이리 예술마을', en: 'Heyri Art Valley' }
        ],
        9: [
            { ko: '수원 화성', en: 'Suwon Hwaseong Fortress' },
            { ko: '남한산성', en: 'Namhansanseong Fortress' }
        ],
        10: [
            { ko: '아침고요수목원', en: 'Garden of Morning Calm' },
            { ko: '서울대공원 벚꽃길', en: 'Seoul Grand Park Cherry Blossom Path' }
        ],
        11: [
            { ko: '쁘띠프랑스', en: 'Petite France' },
            { ko: '가평 레일바이크', en: 'Gapyeong Rail Bike' }
        ],
        0: [
            { ko: '팔당호 유람선', en: 'Paldang Lake Cruise' },
            { ko: '남한산성 둘레길', en: 'Namhansanseong Eco Trail' }
        ],
        1: [
            { ko: '온마운트 워터파크', en: 'Onemount Water Park' },
            { ko: '양수리 수영장', en: 'Yangsu-ri Swimming Pool' }
        ],
        2: [
            { ko: '남이섬', en: 'Nami Island' },
            { ko: '자라섬 재즈페스티벌', en: 'Jarasum Jazz Festival' }
        ],
        3: [
            { ko: '여주 도자기 축제', en: 'Yeoju Ceramic Festival' },
            { ko: '안성 남사당 바우덕이 축제', en: 'Anseong Namsadang Baudeogi Festival' }
        ],
        4: [
            { ko: '수원 화성문화제', en: 'Suwon Hwaseong Cultural Festival' },
            { ko: '광명동굴', en: 'Gwangmyeong Cave' }
        ],
        5: [
            { ko: '파주 프로방스마을', en: 'Paju Provence Village' },
            { ko: '광교 호수공원 단풍길', en: 'Gwanggyo Lake Park Fall Foliage' }
        ],
        6: [
            { ko: '에버랜드 크리스마스 판타지', en: 'Everland Christmas Fantasy' },
            { ko: '수원 화성 야간개장', en: 'Suwon Hwaseong Night Tour' }
        ]
    },
    '강원도': {
        7: [
            { ko: '용평리조트', en: 'Yongpyong Resort' },
            { ko: '알펜시아 리조트', en: 'Alpensia Resort' }
        ],
        8: [
            { ko: '하이원리조트', en: 'High1 Resort' },
            { ko: '태백산 눈축제', en: 'Taebaeksan Snow Festival' }
        ],
        9: [
            { ko: '설악산국립공원', en: 'Seoraksan National Park' },
            { ko: '오대산국립공원', en: 'Odaesan National Park' }
        ],
        10: [
            { ko: '춘천 소양강 스카이워크', en: 'Chuncheon Soyanggang Skywalk' },
            { ko: '남이섬 벚꽃길', en: 'Nami Island Cherry Blossom Road' }
        ],
        11: [
            { ko: '속초해변', en: 'Sokcho Beach' },
            { ko: '고성 공룡박물관', en: 'Goseong Dinosaur Museum' }
        ],
        0: [
            { ko: '청담폭포', en: 'Cheongdam Waterfall' },
            { ko: '정선 아리랑마을', en: 'Jeongseon Arirang Village' }
        ],
        1: [
            { ko: '주문진해변', en: 'Jumunjin Beach' },
            { ko: '속초 아쿠아플라넷', en: 'Sokcho Aqua Planet' }
        ],
        2: [
            { ko: '환선굴', en: 'Hwanseon Cave' },
            { ko: '삼척 바다열차', en: 'Samcheok Ocean Rail Bike' }
        ],
        3: [
            { ko: '강촌 레일바이크', en: 'Gangchon Rail Bike' },
            { ko: '내린천 래프팅', en: 'Naerincheon Rafting' }
        ],
        4: [
            { ko: '내린천 국립휴양림 단풍', en: 'Naerincheon National Recreational Forest Fall Foliage' },
            { ko: '설악산 단풍', en: 'Seoraksan Autumn Foliage' }
        ],
        5: [
            { ko: '오죽헌', en: 'Ojukheon House' },
            { ko: '강릉 커피거리', en: 'Gangneung Coffee Street' }
        ],
        6: [
            { ko: '대관령 양떼목장', en: 'Daegwallyeong Sheep Farm' },
            { ko: '평창 송어 축제', en: 'Pyeongchang Trout Festival' }
        ]
    },
    '충청북도': {
        7: [
            { ko: '단양 얼음축제', en: 'Danyang Ice Festival' },
            { ko: '법주사 설경', en: 'Beopjusa Temple Winter Scenery' }
        ],
        8: [
            { ko: '제천 청풍호조정공원', en: 'Jecheon Cheongpung Lake Park' },
            { ko: '월악산 겨울 트레킹', en: 'Woraksan Winter Trek' }
        ],
        9: [
            { ko: '상당산성', en: 'Sangdang Fortress' },
            { ko: '청주랜드 놀이공원', en: 'Cheongju Land Amusement Park' }
        ],
        10: [
            { ko: '청남대 벚꽃길', en: 'Cheongnamdae Cherry Blossom Road' },
            { ko: '오월드 벚꽃 축제', en: 'O-World Cherry Blossom Festival' }
        ],
        11: [
            { ko: '수안보 온천', en: 'Suanbo Hot Springs' },
            { ko: '의림지 연꽃단지', en: 'Uirimji Lotus Gardens' }
        ],
        0: [
            { ko: '소백산국립공원', en: 'Sobaeksan National Park' },
            { ko: '월악산국립공원', en: 'Woraksan National Park' }
        ],
        1: [
            { ko: '청풍호반 케이블카', en: 'Cheongpung Lake Cable Car' },
            { ko: '단양 강변 유람선', en: 'Danyang Riverside Cruise' }
        ],
        2: [
            { ko: '청주 한지테마파크', en: 'Cheongju Hanji Theme Park' },
            { ko: '고수동굴', en: 'Gosu Cave' }
        ],
        3: [
            { ko: '제천 한방엑스포', en: 'Jecheon Medicinal Herbs Expo' },
            { ko: '충주 월아천 단풍', en: 'Chungju Woola Stream Fall Foliage' }
        ],
        4: [
            { ko: '괴산 산막이옛길 단풍', en: 'Goesan Sanmagi Trail Fall Foliage' },
            { ko: '청주 흥덕사 단풍', en: 'Cheongju Heungdeoksa Temple Fall Foliage' }
        ],
        5: [
            { ko: '충주호 미술관 단풍', en: 'Chungjuho Art Valley Fall Foliage' },
            { ko: '제천 의림지 단풍', en: 'Jecheon Uirimji Autumn Foliage' }
        ],
        6: [
            { ko: '단양 겨울 설경 트레킹', en: 'Danyang Winter Trek' },
            { ko: '보은 속리산 설경', en: 'Boeun Songnisan Winter Scenery' }
        ]
    },
    '충청남도': {
        7: [
            { ko: '공산성 설경', en: 'Gongsanseong Fortress Winter Scenery' },
            { ko: '백제문화단지 겨울', en: 'Baekje Cultural Land Winter' }
        ],
        8: [
            { ko: '독립기념관 겨울 풍경', en: 'Independence Hall Winter View' },
            { ko: '마곡사 설경', en: 'Magoksa Temple Snow Scenery' }
        ],
        9: [
            { ko: '태안 안면도 유채꽃', en: 'Taean Anmyeon Island Canola Blossoms' },
            { ko: '공주 공산성 산책', en: 'Gongju Gongsanseong Walking' }
        ],
        10: [
            { ko: '태안 세계튤립축제', en: 'Taean World Tulip Festival' },
            { ko: '서천 국립생태원 벚꽃', en: 'Seocheon National Institute of Ecology Cherry Blossoms' }
        ],
        11: [
            { ko: '보령 머드축제', en: 'Boryeong Mud Festival' },
            { ko: '천안 독립기념관 야외 공연', en: 'Cheonan Independence Hall Outdoor Performance' }
        ],
        0: [
            { ko: '태안 해안국립공원', en: 'Taean Coastal National Park' },
            { ko: '대천 해수욕장', en: 'Daecheon Beach' }
        ],
        1: [
            { ko: '대천 해수욕장', en: 'Daecheon Beach' },
            { ko: '무창포 해수욕장', en: 'Muchangpo Beach' }
        ],
        2: [
            { ko: '삽교호 출렁다리', en: 'Sapgyoho Suspension Bridge' },
            { ko: '보령 무창포 낙조', en: 'Boryeong Muchangpo Sunset' }
        ],
        3: [
            { ko: '계룡산 단풍 트레킹', en: 'Gyeryongsan Autumn Trek' },
            { ko: '서산 홍성 은행나무길', en: 'Seosan-Hongseong Ginkgo Road' }
        ],
        4: [
            { ko: '천안 삼거리 축제', en: 'Cheonan Samgeori Festival' },
            { ko: '홍성 남당항 노을', en: 'Hongseong Namdang Port Sunset' }
        ],
        5: [
            { ko: '공주 무령왕릉 단풍', en: 'Gongju Muryeong King’s Tomb Fall Foliage' },
            { ko: '문헌서원 가을', en: 'Munheon Seowon Autumn' }
        ],
        6: [
            { ko: '수덕사 설경', en: 'Sudeoksa Temple Winter Scenery' },
            { ko: '보령 겨울 이벤트', en: 'Boryeong Winter Events' }
        ]
    },
    '전라북도': {
        7: [
            { ko: '무주 덕유산 스키장', en: 'Muju Deogyusan Ski Resort' },
            { ko: '전주 한옥마을 설경', en: 'Jeonju Hanok Village Winter Scenery' }
        ],
        8: [
            { ko: '진안 마이산 설경', en: 'Jinan Maisan Winter Scenery' },
            { ko: '남원 광한루 얼음 썰매', en: 'Namwon Gwanghallu Ice Sledding' }
        ],
        9: [
            { ko: '전주 벚꽃길', en: 'Jeonju Cherry Blossom Path' },
            { ko: '고창 선운사 봄꽃', en: 'Gochang Seonunsa Spring Blossoms' }
        ],
        10: [
            { ko: '전주 꽃 축제', en: 'Jeonju Flower Festival' },
            { ko: '선운사 벚꽃', en: 'Seonunsa Cherry Blossoms' }
        ],
        11: [
            { ko: '운일암반일암 트레킹', en: 'Unilam–Banilam Trek (Jinan)' },
            { ko: '채석강', en: 'Chaesokgang (Buan)' }
        ],
        0: [
            { ko: '변산반도 국립공원', en: 'Byeonsanbando National Park' },
            { ko: '구천동 계곡', en: 'Gucheon-dong Valley (Muju)' }
        ],
        1: [
            { ko: '태권도원', en: 'Taekwondowon (Muju)' },
            { ko: '자만벽화마을', en: 'Jaman Mural Village (Jeonju)' }
        ],
        2: [
            { ko: '내장산국립공원', en: 'Naejangsan National Park' },
            { ko: '변산 해수욕장', en: 'Byeonsan Beach' }
        ],
        3: [
            { ko: '두륜산 단풍', en: 'Duryunsan Fall Foliage (Jangsu)' },
            { ko: '발효소스토리 투어', en: 'Fermentation Tour (Sunchang)' }
        ],
        4: [
            { ko: '내장산단풍축제', en: 'Naejangsan Fall Festival' },
            { ko: '막걸리 거리', en: 'Makgeolli Street (Jeonju)' }
        ],
        5: [
            { ko: '시간여행마을', en: 'Time Travel Village (Gunsan)' },
            { ko: '지리산 단풍', en: 'Jirisan Autumn (Namwon)' }
        ],
        6: [
            { ko: '사계절 눈꽃길', en: 'Four Seasons Snow Flower Trail (Muju)' },
            { ko: '크리스마스 마켓', en: 'Christmas Market (Jeonju)' }
        ]
    },
    '전라남도': {
        7: [
            { ko: '오동도 겨울 산책', en: 'Odongdo Winter Walk (Yeosu)' },
            { ko: '순천만 겨울 철새', en: 'Suncheon Bay Winter Birds' }
        ],
        8: [
            { ko: '화순 고인돌 유적', en: 'Hwasun Dolmen Sites' },
            { ko: '목포 갓바위 설경', en: 'Mokpo Gatbawi Rock Winter Scenery' }
        ],
        9: [
            { ko: '여수 벚꽃 열차', en: 'Yeosu Cherry Blossom Train' },
            { ko: '순천만 국립정원 봄', en: 'Spring at Suncheon Bay National Garden' }
        ],
        10: [
            { ko: '팽목항 유채꽃', en: 'Paengmok Port Canola Blossoms (Jindo)' },
            { ko: '죽녹원', en: 'Damyang Bamboo Forest' }
        ],
        11: [
            { ko: '갓바위', en: 'Gatbawi (Mokpo)' },
            { ko: '우주발사전망대', en: 'Space Observatory (Goheung)' }
        ],
        0: [
            { ko: '녹차밭', en: 'Green Tea Fields (Boseong)' },
            { ko: '해상관광 케이블카', en: 'Yeosu Cable Car' }
        ],
        1: [
            { ko: '땅끝마을', en: 'Ttangkkeut Village (Haenam)' },
            { ko: '명사십리 해변', en: 'Myeongsasimni Beach (Wando)' }
        ],
        2: [
            { ko: '밤바다 낭만포차', en: 'Night Seafood Stalls (Yeosu)' },
            { ko: '율포해수욕장', en: 'Yulpo Beach (Boseong)' }
        ],
        3: [
            { ko: '갈대축제', en: 'Reed Festival (Suncheon Bay)' },
            { ko: '매화마을', en: 'Plum Village (Gwangyang)' }
        ],
        4: [
            { ko: '메타세쿼이아길', en: 'Metasequoia Road (Damyang)' },
            { ko: '산수유마을', en: 'Sansuyu Village (Gurye)' }
        ],
        5: [
            { ko: '선암사 단풍', en: 'Seonamsa Autumn (Suncheon)' },
            { ko: '진남관 단풍', en: 'Jinnamgwan Autumn (Yeosu)' }
        ],
        6: [
            { ko: '꼬막축제', en: 'Cockle Festival (Beolgyo)' },
            { ko: '철새축제', en: 'Migratory Bird Festival (Suncheon Bay)' }
        ]
    },
    '경상북도': {
        7: [
            { ko: '하회마을 설경', en: 'Hahoe Folk Village Winter Scenery (Andong)' },
            { ko: '장기야구장 얼음낚시', en: 'Ice Fishing at Janggi Stadium (Pohang)' }
        ],
        8: [
            { ko: '프로방스 마을 겨울', en: 'Provence Village Winter (Cheongdo)' },
            { ko: '부석사 설경', en: 'Buseoksa Temple Snow Scenery (Yeongju)' }
        ],
        9: [
            { ko: '벚꽃 축제', en: 'Cherry Blossom Festival (Gyeongju)' },
            { ko: '문경새재 옛길', en: 'Mungyeong Saejae Historic Trail' }
        ],
        10: [
            { ko: '불국사 벚꽃', en: 'Bulguksa Cherry Blossoms (Gyeongju)' },
            { ko: '임하댐 벚꽃', en: 'Imha Dam Blossoms (Andong)' }
        ],
        11: [
            { ko: '호미곶 등대 축제', en: 'Homigot Lighthouse Festival (Pohang)' },
            { ko: '경주 역사유적지 투어', en: 'Historic Sites Tour (Gyeongju)' }
        ],
        0: [
            { ko: '문경 케이블카', en: 'Mungyeong Cable Car' },
            { ko: '찜닭 거리', en: 'Jjimdak Street (Andong)' }
        ],
        1: [
            { ko: '보문호 수상레저', en: 'Bomun Lake Water Sports (Gyeongju)' },
            { ko: '영일대 해수욕장', en: 'Yeongildae Beach (Pohang)' }
        ],
        2: [
            { ko: '송이축제', en: 'Pine Cone Festival (Uljin)' },
            { ko: '첨성대 야간개장', en: 'Cheomseongdae Night Opening (Gyeongju)' }
        ],
        3: [
            { ko: '소백산 등반', en: 'Sobaeksan Climb (Yeongju)' },
            { ko: '청량산 단풍', en: 'Cheongnyangsan Autumn (Bonghwa)' }
        ],
        4: [
            { ko: '문화의 거리 단풍', en: 'Cultural Street Fall (Andong)' },
            { ko: '사과축제', en: 'Apple Festival (Mungyeong)' }
        ],
        5: [
            { ko: '블루로드 산책', en: 'Blue Road Walk (Yeongdeok)' },
            { ko: '월영교 단풍', en: 'Woryeonggyo Bridge Autumn (Andong)' }
        ],
        6: [
            { ko: '크리스마스 불빛축제', en: 'Christmas Light Festival (Pohang)' },
            { ko: '가송문화축제', en: 'Gasong Culture Festival (Andong)' }
        ]
    },
    '경상남도': {
        7: [
            { ko: '남강 설경', en: 'Namgang Winter View (Jinju)' },
            { ko: '매물도 겨울', en: 'Maemuldo Winter Scenery (Geoje)' }
        ],
        8: [
            { ko: '동피랑 벽화마을 겨울', en: 'Dongpirang Mural Village Winter (Tongyeong)' },
            { ko: '독선대 설경', en: 'Dokseondae Rock Snow Scenery (Sacheon)' }
        ],
        9: [
            { ko: '군항제', en: 'Cherry Blossom Festival (Jinhae)' },
            { ko: '미륵산 케이블카', en: 'Mireuksan Cable Car (Tongyeong)' }
        ],
        10: [
            { ko: '성산산 벚꽃길', en: 'Seongsan Mountain Cherry Blossom Road (Jinju)' },
            { ko: '수승대 벚꽃', en: 'Suseungdae Cherry Blossoms (Geochang)' }
        ],
        11: [
            { ko: '독일마을', en: 'German Village (Namhae)' },
            { ko: '차 문화 축제', en: 'Tea Culture Festival (Hadong)' }
        ],
        0: [
            { ko: '용지호수', en: 'Yongji Lake (Changwon)' },
            { ko: '영상테마파크', en: 'Yongbi Film Theme Park (Hapcheon)' }
        ],
        1: [
            { ko: '비토섬 해변', en: 'Bito Island Beach (Sacheon)' },
            { ko: '구조라 해수욕장', en: 'Gujora Beach (Geoje)' }
        ],
        2: [
            { ko: '해상케이블카 야간', en: 'Night Coastal Cable Car (Tongyeong)' },
            { ko: '상주 해수욕장', en: 'Sangju Beach (Namhae)' }
        ],
        3: [
            { ko: '야생차축제', en: 'Wild Tea Festival (Hadong)' },
            { ko: '남강유등축제', en: 'Lantern Festival (Jinju)' }
        ],
        4: [
            { ko: '해금강 단풍', en: 'Haegumgang Fall Foliage (Geoje)' },
            { ko: '군항제 후기', en: 'Late Jinhae Military Port Festival (Changwon)' }
        ],
        5: [
            { ko: '한방약초축제', en: 'Herbal Medicine Festival (Sancheong)' },
            { ko: '얼음골 단풍', en: 'Eoreumgol Autumn (Miryang)' }
        ],
        6: [
            { ko: '트리문화축제', en: 'Christmas Tree Culture Festival (Tongyeong)' },
            { ko: '가야테마파크 겨울', en: 'Gaya Theme Park Winter (Gimhae)' }
        ]
    },
    '제주특별자치도': {
        7: [
            { ko: '한라산 설경', en: 'Hallasan Winter Scenery' },
            { ko: '성산일출봉 일출', en: 'Sunrise at Seongsan Peak' }
        ],
        8: [
            { ko: '섭지코지 동백꽃', en: 'Seopjikoji Camellias' },
            { ko: '만장굴 동굴 탐험', en: 'Manjanggul Cave Exploration' }
        ],
        9: [
            { ko: '제주 벚꽃길', en: 'Jeju Cherry Blossom Road' },
            { ko: '우도 봄 드라이브', en: 'Udo Spring Drive' }
        ],
        10: [
            { ko: '유채꽃 축제', en: 'Canola Flower Festival' },
            { ko: '성읍민속마을', en: 'Seongeup Folk Village' }
        ],
        11: [
            { ko: '협재 해수욕장', en: 'Hyeopjae Beach' },
            { ko: '주상절리대', en: 'Jusangjeolli Cliffs' }
        ],
        0: [
            { ko: '금오름 트레킹', en: 'Geomunoreum Trek' },
            { ko: '표선 해비치 해변', en: 'Pyoseon Haevichi Beach' }
        ],
        1: [
            { ko: '함덕 해수욕장', en: 'Hamdeok Beach' },
            { ko: '색달 해변', en: 'Saekdal Beach' }
        ],
        2: [
            { ko: '칠십리 해안도로', en: '70-ri Coastal Road' },
            { ko: '산방산 트레킹', en: 'Sanbangsan Trek' }
        ],
        3: [
            { ko: '성산 등반', en: 'Seongsan Peak Hike' },
            { ko: '청수해변', en: 'Cheongsu Beach' }
        ],
        4: [
            { ko: '한라산 단풍', en: 'Hallasan Autumn Foliage' },
            { ko: '산굼부리 분화구', en: 'Sanheungburi Crater' }
        ],
        5: [
            { ko: '민속촌 단풍', en: 'Folk Village Fall Foliage' },
            { ko: '김녕 미로공원', en: 'Gimnyeong Maze Park' }
        ],
        6: [
            { ko: '빛축제', en: 'Christmas Light Festival' },
            { ko: '정방폭포 해안 산책', en: 'Jeongbang Waterfall Coastal Walk' }
        ]
    }
};

// 의류/준비물 추천
function clothingAdvice(tC) {
    if (tC >= 28) return '🍦 반팔·선크림';
    if (tC >= 22) return '👕 가벼운 옷';
    if (tC >= 16) return '👔 긴팔·얇은 겉옷';
    if (tC >= 10) return '🧥 재킷';
    return '🧣 코트·패딩';
}

function preload() {
    font = loadFont('./data/Title.ttf');
    tempTable = loadTable('./data/temp.csv', 'csv', 'header');
    rainTable = loadTable('./data/rain.csv', 'csv', 'header');
    img = loadImage('./data/Layer1.png');
}

function setup() {


    // 캔버스
    createCanvas(planeSize, planeSize, WEBGL).style('position', 'absolute');
    gl = this._renderer;

    textFont(font);
    textSize(12);
    textAlign(CENTER, CENTER);
    noStroke();
    angleMode(RADIANS);
    headerImg = createImg('./data/header.png')
        .attribute('id', 'headerImg')
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '50%')
        .style('transform', 'translateX(-50%)')
        .style('width', 'auto')
        .style('height', 'auto')
        .style('z-index', '10');

    headerImg.elt.onload = () => {
        // 실제 자연 높이를 넘겨주면 툴팁/버튼 모두 올바른 위치에 배치됩니다.
        const h = headerImg.elt.naturalHeight;
        canvasPosition(h);
    };
    // CSV 파싱
    const monthsCount = tempTable.getRowCount();
    const regions = tempTable.columns.filter(c => c !== '일시');

    for (let region of regions) {
        if (!(region in regionCoords)) continue;
        const coords = regionCoords[region];
        const temps = [], rains = [];
        for (let i = 0; i < monthsCount; i++) {
            const t = parseFloat(tempTable.getString(i, region));
            const r = parseFloat(rainTable.getString(i, region));
            temps.push(isNaN(t) ? 0 : t);
            rains.push(isNaN(r) ? 0 : r);
        }
        const avgT = temps.reduce((a, b) => a + b, 0) / monthsCount;
        const avgR = rains.reduce((a, b) => a + b, 0) / monthsCount;
        cities.push({ ...coords, region, temps, rains, avgT, avgR, currentTempH: 0, targetTempH: 0, currentRainH: 0, targetRainH: 0 });
    }

    // 툴팁 스타일
    const tip = select('#tooltip');
    tip.style('position', 'absolute')
        .style('right', '10px')
        .style('bottom', '10px')
        .style('background', 'rgba(255,255,255,0.9)')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
        .style('display', 'none')
        .style('z-index', '10');


    // 언어·단위 토글 (HTML 내에 select#langSel, select#unitSel 있어야 함)
    select('#langSel').changed(e => { lang = e.target.value; updateInfo(); });
    select('#unitSel').changed(e => { unit = e.target.value; updateInfo(); });

    // 초기 설정
    selectMonth(0);
    updateInfo();
    if (API_KEY) fetchRealtime();
}

function draw() {
    background(188, 226, 235);
    orbitControl();
    ambientLight(150);
    directionalLight(255, 255, 255, 0, -1, -1);

    // 지형
    push();
    rotateX(HALF_PI);
    texture(img);
    plane(planeSize, planeSize);
    pop();

    // 막대
    for (let c of cities) {
        c.currentTempH = lerp(c.currentTempH, c.targetTempH, 0.05);
        c.currentRainH = lerp(c.currentRainH, c.targetRainH, 0.05);

        // 온도
        push();
        translate(c.x - 15, -c.currentTempH / 2, c.z);
        ambientMaterial(200, 100, 200);
        box(15, c.currentTempH, 15);
        pop();

        // 강수
        push();
        translate(c.x + 15, -c.currentRainH / 2, c.z);
        ambientMaterial(100, 150, 255);
        box(15, c.currentRainH, 15);
        pop();

        // 이름
        push();
        translate(c.x, -max(c.currentTempH, c.currentRainH) - 10, c.z);
        fill(0);
        text(c.region, 0, 0);
        pop();
    }

    handleTooltip();
}
function canvasPosition(headerHeight) {
    // 1) 캔버스 위치 조정
    select('canvas')
        .style('top', `${headerHeight}px`);

    // 2) 툴팁 스타일 & 위치 (왼쪽 흰 박스)
    select('#tooltip')
        .style('position', 'absolute')
        .style('left', '20px')
        .style('top', `${headerHeight + 50}px`)    // 캔버스 위로부터 50px 내려옴
        .style('width', '260px')
        .style('min-height', '140px')
        .style('background', '#fff')
        .style('padding', '12px')
        .style('border-radius', '16px')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
        .style('z-index', '20')
        .style('display', 'none');

    // 3) 버튼 컨테이너 생성 & 위치 (오른쪽 세로영역)
    const controlsDiv = createDiv().parent(document.body)
        .style('position', 'absolute')
        .style('right', '20px')
        .style('top', `${headerHeight + 100}px`)
        .style('display', 'flex')
        .style('flex-direction', 'column')    // 세로 정렬
        .style('gap', '10px')
        .style('background', 'rgba(255,255,255,0.8)')
        .style('padding', '8px')
        .style('border-radius', '8px')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)')
        .style('z-index', '15');

    // 4) 월별 버튼 & 평균 버튼 추가
    const monthsCount = tempTable.getRowCount();
    for (let i = 0; i < monthsCount; i++) {
        const btn = createButton(tempTable.getString(i, '일시')).parent(controlsDiv);
        styleButton(btn);
        btn.mousePressed(() => selectMonth(i));
    }
    const avgBtn = createButton(I18N[lang].avg).parent(controlsDiv);
    styleButton(avgBtn);
    avgBtn.mousePressed(() => selectMonth('avg'));
}

function worldToScreen(x, y, z) {
    const mv = gl.uMVMatrix.mat4, p = gl.uPMatrix.mat4;
    const v = [x, y, z, 1];
    const mvv = [
        mv[0] * v[0] + mv[4] * v[1] + mv[8] * v[2] + mv[12] * v[3],
        mv[1] * v[0] + mv[5] * v[1] + mv[9] * v[2] + mv[13] * v[3],
        mv[2] * v[0] + mv[6] * v[1] + mv[10] * v[2] + mv[14] * v[3],
        mv[3] * v[0] + mv[7] * v[1] + mv[11] * v[2] + mv[15] * v[3]
    ];
    const clip = [
        p[0] * mvv[0] + p[4] * mvv[1] + p[8] * mvv[2] + p[12] * mvv[3],
        p[1] * mvv[0] + p[5] * mvv[1] + p[9] * mvv[2] + p[13] * mvv[3],
        p[2] * mvv[0] + p[6] * mvv[1] + p[10] * mvv[2] + p[14] * mvv[3],
        p[3] * mvv[0] + p[7] * mvv[1] + p[11] * mvv[2] + p[15] * mvv[3]
    ];
    const ndcX = clip[0] / clip[3], ndcY = clip[1] / clip[3];
    return {
        x: (ndcX * 0.5 + 0.5) * width,
        y: (1 - (ndcY * 0.5 + 0.5)) * height
    };
}

function handleTooltip() {
    const tip = select('#tooltip');
    let shown = false;
    for (let c of cities) {
        const pos = worldToScreen(c.x, -c.currentTempH / 2, c.z);
        if (dist(mouseX, mouseY, pos.x, pos.y) < 8) {
            // 온도
            const T = currentIdx === 'avg' ? c.avgT : c.temps[currentIdx];
            const dT = unit === 'F' ? (T * 9 / 5 + 32).toFixed(1) : T.toFixed(1);
            // 강수
            const R = currentIdx === 'avg' ? c.avgR : c.rains[currentIdx];
            const dR = R.toFixed(1) + ' mm';
            // 관광지
            const arr = attractions[c.region]?.[currentIdx] || [];
            const act = arr.map(o => o[lang]).join(', ');

            tip.html(
                `<b>${c.region}</b><br>` +
                `${dT}°${unit}<br>` +
                `${I18N[lang].rain}: ${dR}<br>` +
                `${I18N[lang].prep}: ${act}`
            )
            tip
                .style('display', 'block')                // <-- 추가
                .style('left', pos.x + 10 + 'px')
                .style('top', pos.y + 10 + 'px')
                .style('opacity', '1')
                .style('transform', 'translate(0, 0) scale(1)');
            shown = true;
            break;
        }
    }
    if (!shown) {
        tip
            .style('display', 'none')                   // <-- 추가
            .style('opacity', '0')
            .style('height', '100px')
            .style('transform', 'translate(-10px, -10px) scale(0.95)');
    }
}


function selectMonth(idx) {
    currentIdx = idx;
    for (let c of cities) {
        const t = (idx === 'avg' ? c.avgT : c.temps[idx]);
        const r = (idx === 'avg' ? c.avgR : c.rains[idx]);
        c.targetTempH = t * 5;
        c.targetRainH = r * 0.3;
    }
    updateInfo();
}

function updateInfo() {
    const info = select('#info');
    const label = (currentIdx === 'avg')
        ? I18N[lang].avg
        : tempTable.getString(currentIdx, '일시');
    let sum = 0;
    cities.forEach(c => sum += (currentIdx === 'avg' ? c.avgT : c.temps[currentIdx]));
    const avgTemp = sum / cities.length;
    const dispAvg = unit === 'F'
        ? (avgTemp * 9 / 5 + 32).toFixed(1)
        : avgTemp.toFixed(1);
    info.html(`<b>${label}</b><br>${dispAvg}°${unit}`);
}

async function fetchRealtime() {
    for (let c of cities) {
        // 추가 구현 가능
    }
}

function styleButton(btn) {
    btn.style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('padding', '6px 12px')
        .style('border-radius', '4px')
        .style('cursor', 'pointer');
    btn.mouseOver(() => btn.style('background', '#eee'));
    btn.mouseOut(() => btn.style('background', '#fff'));
}

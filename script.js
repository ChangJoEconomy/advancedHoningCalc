// 재료가격 정보를 json 기반 업데이트
document.addEventListener("DOMContentLoaded", function() {
    // materials.json 파일에서 재료 데이터를 불러옵니다.
    fetch("materials.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("네트워크 응답에 문제가 있습니다.");
            }
            return response.json();
        })
        .then(data => {
            // JSON 데이터의 materials 배열을 순회하면서 가격 정보를 업데이트합니다.
            data.materials.forEach(material => {
                // 각 재료의 가격 입력 요소의 id는 material.id + "Price"로 구성되어 있습니다.
                const priceInput = document.getElementById(material.id + "Price");
                if (priceInput) {
                    priceInput.value = material.price;
                } else {
                    console.warn("입력 요소를 찾을 수 없습니다: " + material.id + "Price");
                }
            });
        })
        .catch(error => {
            console.error("재료 정보를 불러오는 중 오류 발생:", error);
        });
});

const ctx = document.getElementById('exValChart').getContext('2d');
const exValChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['1%', '', '10%', '', '20%', '', '30%', '', '40%', '', '50%', '', '60%', '', '70%', '', '80%', '', '90%', '', '100%'], // x축 레이블 (확률)
        datasets: [{
            label: '기대값',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y축 데이터 (골드)
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)', // 선 아래 영역을 채울 색상
            fill: true // 선 아래 영역을 채우도록 설정
        }]        
    },
    options: {
        interaction: {
            mode: 'index',
            intersect: false,
            axis: 'x'
        },
        plugins: {
            legend: {
                display: false // 레전드(라벨 표시) 숨기기
            },
            tooltip: {
                callbacks: {
                    // 모든 라벨을 숨기기
                    beforeLabel: function(tooltipItem, data) {
                        return null;
                    },
                    // 커스텀 툴팁 출력
                    label: function(context) {
                        const xIndex = context.dataIndex;
                        const probability = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100][xIndex]
                        const yValue = context.parsed.y;

                        // 두 줄의 라벨 생성
                        return [`상위: ${probability}%`, `기대값: ${yValue}골드`];
                    },
                    // 타이틀 숨기기
                    title: function(tooltipItem, data) {
                        return null;
                    }
                }
            }
        },
        scales: {
            x: { // X축 설정
                title: {
                    display: true, // X축 라벨 표시
                    text: '상위(%)' // X축 라벨 내용
                }
            },
            y: { // Y축 설정
                title: {
                    display: true, // Y축 라벨 표시
                    text: '골드' // Y축 라벨 내용
                },
                beginAtZero: true, // Y축이 0부터 시작하도록 설정
                min: 0, // 최소값을 0으로 설정
            }
        }
    }    
});

// 강화에 포함시킬 재료를 아이템 티어, 종류에 따라 자동 업데이트
updateMaterialText();
function updateMaterialText() {
    const type = document.querySelector('input[name="type"]:checked')?.value;
    const tier = document.querySelector('input[name="tier"]:checked')?.value;

    if(type === "weapon") { // 무기
        if(tier === "T3") {
            document.querySelector('label[for="suhoeSeok"]').innerText = "정파강";
            document.querySelector('label[for="dolpaSeok"]').innerText = "찬명돌";
            document.querySelector('label[for="abidos"]').innerText = "최상레하";
            document.querySelector('label[for="papyeon"]').innerText = "명예의 파편";
        } else if(tier === "T4") {
            document.querySelector('label[for="suhoeSeok"]').innerText = "운파";
            document.querySelector('label[for="dolpaSeok"]').innerText = "운돌";
            document.querySelector('label[for="abidos"]').innerText = "아비도스";
            document.querySelector('label[for="papyeon"]').innerText = "운명의 파편";
        }
    } else {  // 방어구
        if(tier === "T3") {
            document.querySelector('label[for="suhoeSeok"]').innerText = "정수강";
            document.querySelector('label[for="dolpaSeok"]').innerText = "찬명돌";
            document.querySelector('label[for="abidos"]').innerText = "최상레하";
            document.querySelector('label[for="papyeon"]').innerText = "명예의 파편";
        } else if(tier === "T4") {
            document.querySelector('label[for="suhoeSeok"]').innerText = "운수";
            document.querySelector('label[for="dolpaSeok"]').innerText = "운돌";
            document.querySelector('label[for="abidos"]').innerText = "아비도스";
            document.querySelector('label[for="papyeon"]').innerText = "운명의 파편";
        }
    }
}

document.querySelectorAll('input[name="type"]').forEach(input =>
    input.addEventListener("change", updateMaterialText)
);
document.querySelectorAll('input[name="tier"]').forEach(input =>
    input.addEventListener("change", updateMaterialText)
);


// 강화 방법 설정
let typeWeapon = false;  // 무기 타입 여부 (true: 무기, false: 방어구)
let itemTier = 4; // 아이템 티어 (3, 4)
let startLv = 0; // 시작 레벨
let targetLv = 40; // 목표 레벨
let includeIngredientList = [true, true, true, true, true, true]; // 재료 포함 여부 (수호석, 돌파석, 아비도스, 운명의 돌파석)
let additinalSet = 0; // (노숨:0, 선조턴:1, 풀숨:2)
let scrollSet = 0; // (노스크롤:0, 선조턴:1, 풀스크롤:3)

// 위 변수들 업데이트 함수
function updateAdvancedRefiningVariables() {
    // 무기 타입 : "weapon"이면 true, 아니면 false
    typeWeapon = document.querySelector('input[name="type"]:checked').value === "weapon";

    // 티어 : "T3"이면 3, "T4"이면 4
    let selectedTier = document.querySelector('input[name="tier"]:checked').value;
    itemTier = (selectedTier === "T3") ? 3 : 4;

    // 시작, 목표 강화 단계 업데이트
    startLv = parseInt(document.getElementById("startLevel").value, 10);
    targetLv = parseInt(document.getElementById("targetLevel").value, 10);

    // 재료 포함 여부 업데이트 (수호석, 돌파석, 아비도스, 운명의 돌파석 순서)
    includeIngredientList = Array.from(document.querySelectorAll('input[name="includeMaterial_check"]')).map(cb => cb.checked);

    // 숨결 설정 업데이트: 노숨 (0), 니베르턴만(1), 선조턴 (2), 풀숨 (3)
    additinalSet = parseInt(document.querySelector('input[name="additionalMaterial"]:checked').value);

    // 스크롤 설정 업데이트: 노스크롤 (0), 선조턴 (1), 풀스크롤 (2)
    scrollSet = parseInt(document.querySelector('input[name="scroll"]:checked').value);
}

// 강화에 필요한 재료 계산
const getRequirements = (isWeapon, tier, phase) => {
    let needSuhoeSeok;
    let needDolpaSeok;
    let needAbidos;
    let needPapyeon;
    let needGold;
    let needSealing;
    let needAddi1;
    let needAddi2;
    let needAddi3;
    let needScroll1;
    let needScroll2;
    
    if(tier === 3){  // 3티어
        if(isWeapon){ // 무기
            if(phase === 1){
                needSuhoeSeok = 1000;
                needDolpaSeok = 28;
                needAbidos = 30;
                needPapyeon = 9000;
                needGold = 1125;
                needSealing = 31500;
            }
            else{
                needSuhoeSeok = 1600;
                needDolpaSeok = 36;
                needAbidos = 33;
                needPapyeon = 17000;
                needGold = 2500;
                needSealing = 50000;
            }
        }
        else{ // 방어구
            if(phase === 1){
                needSuhoeSeok = 950;
                needDolpaSeok = 22;
                needAbidos = 18;
                needPapyeon = 5500;
                needGold = 950;
                needSealing = 28500;
            }
            else{
                needSuhoeSeok = 1300;
                needDolpaSeok = 28;
                needAbidos = 20;
                needPapyeon = 11000;
                needGold = 1800;
                needSealing = 40000;
            }
        }
    }
    else{  // 4티어
        if(isWeapon){ // 무기
            if(phase === 1){
                needSuhoeSeok = 600;
                needDolpaSeok = 16;
                needAbidos = 25;
                needPapyeon = 5000;
                needGold = 1125;
                needSealing = 31500;
            }
            else if(phase === 2){
                needSuhoeSeok = 1100;
                needDolpaSeok = 22;
                needAbidos = 27;
                needPapyeon = 10000;
                needGold = 2500;
                needSealing = 50000;
            }
            else if(phase === 3){
                needSuhoeSeok = 1200;
                needDolpaSeok = 25;
                needAbidos = 28;
                needPapyeon = 11500;
                needGold = 3000;
                needSealing = 55000;
            }
            else{
                needSuhoeSeok = 1400;
                needDolpaSeok = 32;
                needAbidos = 30;
                needPapyeon = 13000;
                needGold = 4000;
                needSealing = 70000;
            }
        }
        else{ // 방어구
            if(phase === 1){
                needSuhoeSeok = 500;
                needDolpaSeok = 12;
                needAbidos = 15;
                needPapyeon = 3000;
                needGold = 950;
                needSealing = 28500;
            }
            else if(phase === 2){
                needSuhoeSeok = 900;
                needDolpaSeok = 16;
                needAbidos = 16;
                needPapyeon = 6000;
                needGold = 1800;
                needSealing = 40000;
            }
            else if(phase === 3){
                needSuhoeSeok = 1000;
                needDolpaSeok = 18;
                needAbidos = 17;
                needPapyeon = 7000;
                needGold = 2000;
                needSealing = 44000;
            }
            else{
                needSuhoeSeok = 1200;
                needDolpaSeok = 23;
                needAbidos = 19;
                needPapyeon = 8000;
                needGold = 2400;
                needSealing = 60000; // to do: 실링 사용량 확인
            }
        }
    }
    // 추가재료
    if(tier === 3) { // 3티어 (태양 시리즈)
        if(phase === 1) {
            needAddi1 = 24;
            needAddi2 = 12;
            needAddi3 = 4;
        }
        else{
            needAddi1 = 36;
            needAddi2 = 18;
            needAddi3 = 6;
        }
    }
    else{  // 4티어 (빙숨, 용숨)
        if(phase === 1) {
            needAddi1 = 12;
        }
        else if(phase === 2){
            needAddi1 = 18;
        }
        else if(phase === 3){
            needAddi1 = 20;
        }
        else{
            needAddi1 = 24;
        }
        needAddi2 = 0;
        needAddi3 = 0;
    }
    // 스크롤
    needScroll1 = phase === 1 ? 1 : 0;
    needScroll2 = phase === 2 ? 1 : 0;
    
    return { needSuhoeSeok, needDolpaSeok, needAbidos, needPapyeon, needGold, needSealing, needAddi1, needAddi2, needAddi3, needScroll1, needScroll2 };
};

// 상재 성공, 대성공, 대대성공 확률 계산
function calculateProbabilities(phase, addiSet, scrollSet) {
    let normalSuccess, bigSuccess, nibereu_normalSuccess, nibereu_bigSuccess, turn_normalSuccess, turn_bigSuccess;
    
    // 일반턴
    if (phase <= 2 && addiSet==3 && scrollSet==2) {  // 일반 강화: 추가재료 & 스크롤 (풀숨 & 풀스크롤)
        normalSuccess = 0;
        bigSuccess = 0.6;
    }
    else if (phase <= 2 && scrollSet==2) {  // 일반 강화: 스크롤만
        normalSuccess = 0.3;
        bigSuccess = 0.45;
    }
    else if (addiSet==3) {  // 일반 강화: 추가재료만
        normalSuccess = 0.5;
        bigSuccess = 0.3;
    }
    else {  // 일반 강화: 없음
        normalSuccess = 0.8;
        bigSuccess = 0.15;
    }

    // 니베르턴
    if (addiSet>=1) {  // 니베르 턴: 추가재료만
        nibereu_normalSuccess = 0.5;
        nibereu_bigSuccess = 0.3;
    }
    else {  // 니베르 턴: 없음
        nibereu_normalSuccess = 0.8;
        nibereu_bigSuccess = 0.15;
    }
    
    // 선조턴
    if (phase <= 2 && addiSet>=2 && scrollSet>=1) {  // 선조의 가호: 추가재료 & 스크롤
        turn_normalSuccess = 0;
        turn_bigSuccess = 0.6;
    }
    else if (phase <= 2 && scrollSet>=1) {  // 선조의 가호: 스크롤만
        turn_normalSuccess = 0.3;
        turn_bigSuccess = 0.45;
    }
    else if (addiSet>=2) {  // 선조의 가호: 추가재료만
        turn_normalSuccess = 0.5;
        turn_bigSuccess = 0.3;
    }
    else {  // 선조의 가호: 없음
        turn_normalSuccess = 0.8;
        turn_bigSuccess = 0.15;
    }
    
    return {
        normalSuccess, 
        bigSuccess,
        nibereu_normalSuccess,
        nibereu_bigSuccess,
        turn_normalSuccess, 
        turn_bigSuccess,
    };
}

function successCalc(normalSuccess, bigSuccess){
    let rand = Math.random();
    if (rand < normalSuccess) { // 성공
        return 10;
    } else if (rand < normalSuccess + bigSuccess) { // 대성공
        return 20;
    } else { // 대대성공
        return 30;
    }
}

function subSimulation(isWeapon, tier, addiSet, scrollSet, phase, needLv) {
    const counts = {
        tryCount: 0,
        turnCount: 0,
        suhoeSeokCount: 0,
        dolpaSeokCount: 0,
        abidosCount: 0,
        papyeonCount: 0,
        useGoldCount: 0,
        sealingCount: 0,
        addi1Count: 0,
        addi2Count: 0,
        addi3Count: 0,
        scroll1Count: 0,
        scroll2Count: 0
    };

    const {
        needSuhoeSeok,
        needDolpaSeok,
        needAbidos,
        needPapyeon,
        needGold,
        needSealing,
        needAddi1,
        needAddi2,
        needAddi3,
        needScroll1,
        needScroll2
    } = getRequirements(isWeapon, tier, phase);


    // 시뮬레이션
    let currentLv = 0;
    let sunJoCount = 0;

    // 성공, 대성공, 대대성공 확률 계산
    const {
        normalSuccess, 
        bigSuccess,
        nibereu_normalSuccess,
        nibereu_bigSuccess,
        turn_normalSuccess, 
        turn_bigSuccess,
    } = calculateProbabilities(phase, addiSet, scrollSet);

    // 시뮬레이션 시작
    while(currentLv < needLv*100) {
        counts.tryCount++;
        if(sunJoCount >= 6) {   // 선조의 가호
            counts.turnCount++;
            sunJoCount = 0;
            // 선조의 가호 강화
            counts.suhoeSeokCount+= needSuhoeSeok;
            counts.dolpaSeokCount+= needDolpaSeok;
            counts.abidosCount+= needAbidos;
            counts.papyeonCount+= needPapyeon;
            counts.useGoldCount+= needGold;
            counts.sealingCount+= needSealing;
            if(addiSet>=2){
                counts.addi1Count+= needAddi1;
                counts.addi2Count+= needAddi2;
                counts.addi3Count+= needAddi3;
            }
            if(phase<=2 && scrollSet>=1){
                counts.scroll1Count+= needScroll1;
                counts.scroll2Count+= needScroll2;
            }
            // 선조의 가호 종류 계산
            if(phase<=2){  // 기본 선조 등장
                let randOutcome = Math.random();
                if (randOutcome < 0.15) { // 갈라투르의 망치 (5배) [15%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) * 5;
                } else if (randOutcome < 0.5) { // 겔라르의 칼 (3배) [35%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) * 3;
                } else if (randOutcome < 0.65) { // 쿠흠바르의 모루 (30 증가 및 재충전) [15%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) + 30;
                    sunJoCount = 6; // 선조의 가호 재충전
                } else { // 테메르의 정 (10 증가 및 다음 재련 무료) [35%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) + 10;
                    if(currentLv >= needLv*100) break; // 이미 목표 달성
                    else{  // 무료 재련
                        counts.tryCount++;
                        if(addiSet>=3){
                            counts.addi1Count+= needAddi1;
                            counts.addi2Count+= needAddi2;
                            counts.addi3Count+= needAddi3;
                        }
                        if(phase<=2 && scrollSet>=2){
                            counts.scroll1Count+= needScroll1;
                            counts.scroll2Count+= needScroll2;
                        }
                        currentLv += successCalc(normalSuccess, bigSuccess);
                    }
                    sunJoCount++;
                }
            }
            else{  // 상재 3~4단계(고급 선조 등장)
                let randOutcome = Math.random();
                if (randOutcome < 0.125) { // 갈라투르의 망치(5배)[12.5%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) * 5;
                } else if (randOutcome < 0.375) { // 겔라르의 칼(3배)[25%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) * 3;
                } else if (randOutcome < 0.5) { // 쿠흠바르의 모루(30 증가 및 재충전)[12.5%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) + 30;
                    sunJoCount = 6;
                } else if (randOutcome < 0.75) { // 테메르의 정(10 증가 및 다음 재련 무료)[25%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) + 10;
                    if(currentLv >= needLv*100) break; // 이미 목표 달성
                    else{  // 무료 재련
                        counts.tryCount++;
                        if(addiSet>=3){
                            counts.addi1Count+= needAddi1;
                            counts.addi2Count+= needAddi2;
                            counts.addi3Count+= needAddi3;
                        }
                        if(phase<=2 && scrollSet>=2){
                            counts.scroll1Count+= needScroll1;
                            counts.scroll2Count+= needScroll2;
                        }
                        currentLv += successCalc(normalSuccess, bigSuccess);
                    }
                    sunJoCount++;
                } else if (randOutcome < 0.875) { // 에베르의 끌 (상재 1단계 증가)[12.5%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess) + 100;
                    currentLv -= currentLv % 100;
                } else { // 니베르의 송곳 (다음 재련에서 고급 선조 등장)[12.5%]
                    currentLv += successCalc(turn_normalSuccess, turn_bigSuccess);
                    if(currentLv >= needLv*100) break; // 이미 목표 달성
                    // 프리미엄 선조
                    counts.tryCount++;
                    counts.turnCount++;
                    counts.suhoeSeokCount+= needSuhoeSeok;
                    counts.dolpaSeokCount+= needDolpaSeok;
                    counts.abidosCount+= needAbidos;
                    counts.papyeonCount+= needPapyeon;
                    counts.useGoldCount+= needGold;
                    counts.sealingCount+= needSealing;
                    if(addiSet>=1){
                        counts.addi1Count+= needAddi1;
                        counts.addi2Count+= needAddi2;
                        counts.addi3Count+= needAddi3;
                    }
                    // 프리미엄 선조 분류
                    let outcome = Math.random();
                    if (outcome < 0.2) { // 갈라르의 망치 (7배)[20%]
                        currentLv += successCalc(nibereu_normalSuccess, nibereu_bigSuccess) * 7;
                    } else if (outcome < 0.4) { // 겔라르의 칼 (5배)[20%]
                        currentLv += successCalc(nibereu_normalSuccess, nibereu_bigSuccess) * 5;
                    } else if (outcome < 0.6) { // 쿠훔바르의 모루 (80증가 및 재충전)[20%]
                        currentLv += successCalc(nibereu_normalSuccess, nibereu_bigSuccess) + 80;
                        sunJoCount = 6;
                    } else if (outcome < 0.8) { // 테메르의 정 (30 증가 및 다음 재련 무료)[20%]
                        currentLv += successCalc(nibereu_normalSuccess, nibereu_bigSuccess) + 30;
                        if (currentLv >= needLv * 100) break;
                        else {
                            counts.tryCount++;
                            if (addiSet >= 3) {
                                counts.addi1Count += needAddi1;
                                counts.addi2Count += needAddi2;
                                counts.addi3Count += needAddi3;
                            }
                            if (phase <= 2 && scrollSet >= 2) {
                                counts.scroll1Count += needScroll1;
                                counts.scroll2Count += needScroll2;
                            }
                            currentLv += successCalc(normalSuccess, bigSuccess);
                        }
                        sunJoCount++;
                    } else {  // 에베르의 끌 (상재 2단계 증가)[20%]
                        currentLv += successCalc(nibereu_normalSuccess, nibereu_bigSuccess) + 200;
                        currentLv -= currentLv % 100;
                    }
                }
            }
            continue;
        }
        // 일반 턴
        sunJoCount++;
        counts.suhoeSeokCount+= needSuhoeSeok;
        counts.dolpaSeokCount+= needDolpaSeok;
        counts.abidosCount+= needAbidos;
        counts.papyeonCount+= needPapyeon;
        counts.useGoldCount+= needGold;
        counts.sealingCount+= needSealing;
        if(addiSet==3){
            counts.addi1Count+= needAddi1;
            counts.addi2Count+= needAddi2;
            counts.addi3Count+= needAddi3;
        }
        if(phase <= 2 && scrollSet==2){
            counts.scroll1Count+= needScroll1;
            counts.scroll2Count+= needScroll2;
        }
        // 단계 증가
        currentLv += successCalc(normalSuccess, bigSuccess);
    }

    // 결과 return
    return [
        counts.tryCount, counts.turnCount, counts.suhoeSeokCount, counts.dolpaSeokCount,
        counts.abidosCount, counts.papyeonCount, counts.useGoldCount, counts.sealingCount,
        counts.addi1Count, counts.addi2Count, counts.addi3Count, counts.scroll1Count, counts.scroll2Count
    ];
}

function simulation(isWeapon, tier, addiSet, scrollSet, phase1Levels, phase2Levels, phase3Levels, phase4Levels) {
    // 누적 카운트를 저장할 배열 (총 13개의 항목)
    let totals = Array(13).fill(0);

    // 각 단계별로 subSimulation 호출 후 누적
    const phases = [
        { phase: 1, levels: phase1Levels },
        { phase: 2, levels: phase2Levels },
        { phase: 3, levels: phase3Levels },
        { phase: 4, levels: phase4Levels }
    ];

    phases.forEach(item => {
        let result = subSimulation(isWeapon, tier, addiSet, scrollSet, item.phase, item.levels);
        for (let i = 0; i < totals.length; i++) {
            totals[i] += result[i];
        }
    });

    // 결과 return (배열의 항목 순서는 subSimulation 함수의 반환 순서를 따름)
    return totals;
}

function getMaterialPrice(isWeapon, tier, includeIngredientList) {
    let suhoeSeokPrice = 0, dolpaSeokPrice = 0, abidosPrice = 0, papyeonPrice = 0, addi1Price = 0, addi2Price = 0, addi3Price = 0, scroll1Price = 0, scroll2Price = 0;
    let suhoeSeokQuantity = 0, dolpaSeokQuantity = 0, abidosQuantity = 0, papyeonQuantity = 0, addi1Quantity = 0, addi2Quantity = 0, addi3Quantity = 0, scroll1Quantity = 0, scroll2Quantity = 0;
    if(tier==3){ // 3티어
        if(isWeapon){  // 무기
            suhoeSeokPrice = parseFloat(document.getElementById("jeongpagangPrice").value);
            suhoeSeokQuantity = parseFloat(document.getElementById("jeongpagangQuantity").value);
        }
        else{  // 방어구
            suhoeSeokPrice = parseFloat(document.getElementById("jeongsugangPrice").value);
            suhoeSeokQuantity = parseFloat(document.getElementById("jeongsugangQuantity").value);
        }
        // 찬명돌, 최상레하, 명파
        dolpaSeokPrice = parseFloat(document.getElementById("chanmyeongdolPrice").value);
        dolpaSeokQuantity = parseFloat(document.getElementById("chanmyeongdolQuantity").value);
        abidosPrice = parseFloat(document.getElementById("chosangRehaPrice").value);
        abidosQuantity = parseFloat(document.getElementById("chosangRehaQuantity").value);
        papyeonPrice = parseFloat(document.getElementById("myeongyeuiPahyeonPrice").value);
        papyeonQuantity = parseFloat(document.getElementById("myeongyeuiPahyeonQuantity").value);
        // 추가재료 (태양 시리즈)
        addi1Price = parseFloat(document.getElementById("taeyanguiEunchongPrice").value);
        addi1Quantity = parseFloat(document.getElementById("taeyanguiEunchongQuantity").value);
        addi2Price = parseFloat(document.getElementById("taeyanguiChukbokPrice").value);
        addi2Quantity = parseFloat(document.getElementById("taeyanguiChukbokQuantity").value);
        addi3Price = parseFloat(document.getElementById("taeyanguiGahoPrice").value);
        addi3Quantity = parseFloat(document.getElementById("taeyanguiGahoQuantity").value);
    }
    else{  // 4티어
        // 수호(파괴)석, 빙(용)숨
        if(isWeapon){ // 무기
            suhoeSeokPrice = parseFloat(document.getElementById("unpaPrice").value);
            suhoeSeokQuantity = parseFloat(document.getElementById("unpaQuantity").value);
            addi1Price = parseFloat(document.getElementById("youngamSumgyeolPrice").value);
            addi1Quantity = parseFloat(document.getElementById("youngamSumgyeolQuantity").value);
        }
        else{  // 방어구
            suhoeSeokPrice = parseFloat(document.getElementById("unsooPrice").value);
            suhoeSeokQuantity = parseFloat(document.getElementById("unsooQuantity").value);
            addi1Price = parseFloat(document.getElementById("binghaeSumgyeolPrice").value);
            addi1Quantity = parseFloat(document.getElementById("binghaeSumgyeolQuantity").value);
        }
        // 운돌, 아비도스, 운명의 파편
        dolpaSeokPrice = parseFloat(document.getElementById("unmyeongdongpaseokPrice").value);
        dolpaSeokQuantity = parseFloat(document.getElementById("unmyeongdongpaseokQuantity").value);
        abidosPrice = parseFloat(document.getElementById("abidosPrice").value);
        abidosQuantity = parseFloat(document.getElementById("abidosQuantity").value);
        papyeonPrice = parseFloat(document.getElementById("unmyeonguiPahyeonPrice").value);
        papyeonQuantity = parseFloat(document.getElementById("unmyeonguiPahyeonQuantity").value);
    }
    // 스크롤
    if(isWeapon){  // 무기
        scroll1Price = parseFloat(document.getElementById("yagemsul1Price").value);
        scroll1Quantity = parseFloat(document.getElementById("yagemsul1Quantity").value);
        scroll2Price = parseFloat(document.getElementById("yagemsul2Price").value);
        scroll2Quantity = parseFloat(document.getElementById("yagemsul2Quantity").value);
    }
    else{  // 방어구
        scroll1Price = parseFloat(document.getElementById("jaebongsul1Price").value);
        scroll1Quantity = parseFloat(document.getElementById("jaebongsul1Quantity").value);
        scroll2Price = parseFloat(document.getElementById("jaebongsul2Price").value);
        scroll2Quantity = parseFloat(document.getElementById("jaebongsul2Quantity").value);
    }
    // 재련 가격에 포함시킬지 여부
    if(!includeIngredientList[0]) suhoeSeokPrice = 0;
    if(!includeIngredientList[1]) dolpaSeokPrice = 0;
    if(!includeIngredientList[2]) abidosPrice = 0;
    if(!includeIngredientList[3]) papyeonPrice = 0;
    if(!includeIngredientList[4]) addi1Price = 0;
    if(!includeIngredientList[4]) addi2Price = 0;
    if(!includeIngredientList[4]) addi3Price = 0;
    if(!includeIngredientList[5]) scroll1Price = 0;
    if(!includeIngredientList[5]) scroll2Price = 0;

    // 재료 가격 return
    return [suhoeSeokPrice, dolpaSeokPrice, abidosPrice, papyeonPrice, addi1Price, addi2Price, addi3Price, scroll1Price, scroll2Price,
            suhoeSeokQuantity, dolpaSeokQuantity, abidosQuantity, papyeonQuantity, addi1Quantity, addi2Quantity, addi3Quantity, scroll1Quantity, scroll2Quantity];
}

function updateChart(results) {
    let quantileData = [];
    const quantiles = [0.01, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];
    const n = results.length;
    quantiles.forEach(q => {
        const index = Math.floor(q * (n - 1));
        quantileData.push(results[index][13]);
    });
    // 차트 데이터 업데이트
    exValChart.data.datasets[0].data = quantileData;
    exValChart.update();
}

function updateResultTable(simulationResults, materialPrices) {
    let medianIndex = Math.floor(simulationResults.length / 2);
    let expectedValue = simulationResults[medianIndex];
    // 기대값 출력
    document.getElementById("expectation").innerText = expectedValue[13].toLocaleString();
    // 결과 테이블 업데이트
    // expectedValue[0] = 시도 횟수
    // expectedValue[1] = 선조 횟수
    // expectedValue[2] = 수호석 소모량
    // expectedValue[3] = 돌파석 소모량
    // expectedValue[4] = 아비도스 소모량
    // expectedValue[5] = 파편 소모량
    // expectedValue[6] = 누골 소모량
    // expectedValue[7] = 실링 소모량
    // expectedValue[8] = 추가재료1 소모량
    // expectedValue[9] = 추가재료2 소모량
    // expectedValue[10] = 추가재료3 소모량
    // expectedValue[11] = 스크롤1단계 소모량
    // expectedValue[12] = 스크롤2단계 소모량
    // expectedValue[13] = 총 사용 골드량
    document.getElementById("tryCount").innerText = expectedValue[0].toLocaleString();
    document.getElementById("turnCount").innerText = expectedValue[1].toLocaleString();
    document.getElementById("sealingCount").innerText = expectedValue[7].toLocaleString();
    // 결과 표 업데이트
    document.getElementById("nugolGold").innerText = expectedValue[6].toLocaleString();  // 누골
    // 수호석
    document.getElementById("suhoseokUsed").innerText = expectedValue[2].toLocaleString();
    document.getElementById("suhoseokPurchase").innerText = Math.max(0, expectedValue[2]-materialPrices[9]).toLocaleString();
    document.getElementById("suhoseokGold").innerText = parseInt(Math.max(0, expectedValue[2]-materialPrices[9]) * materialPrices[0]).toLocaleString();
    // 돌파석
    document.getElementById("dolpaseokUsed").innerText = expectedValue[3].toLocaleString();
    document.getElementById("dolpaseokPurchase").innerText = Math.max(0, expectedValue[3]-materialPrices[10]).toLocaleString();
    document.getElementById("dolpaseokGold").innerText = parseInt(Math.max(0, expectedValue[3]-materialPrices[10]) * materialPrices[1]).toLocaleString();
    // 아비도스
    document.getElementById("abidosUsed").innerText = expectedValue[4].toLocaleString();
    document.getElementById("abidosPurchase").innerText = Math.max(0, expectedValue[4]-materialPrices[11]).toLocaleString();
    document.getElementById("abidosGold").innerText = parseInt(Math.max(0, expectedValue[4]-materialPrices[11]) * materialPrices[2]).toLocaleString();
    // 파편  (여기부터 업데이트)
    document.getElementById("pahyeonUsed").innerText = expectedValue[5].toLocaleString();
    document.getElementById("pahyeonPurchase").innerText = Math.max(0, expectedValue[5]-materialPrices[12]).toLocaleString();
    document.getElementById("pahyeonGold").innerText = parseInt(Math.max(0, expectedValue[5]-materialPrices[12]) * materialPrices[3]).toLocaleString();
    // 추가재료1
    document.getElementById("additional1Used").innerText = expectedValue[8].toLocaleString();
    document.getElementById("additional1Purchase").innerText = Math.max(0, expectedValue[8]-materialPrices[13]).toLocaleString();
    document.getElementById("additional1Gold").innerText = parseInt(Math.max(0, expectedValue[8]-materialPrices[13]) * materialPrices[4]).toLocaleString();
    // 추가재료2
    document.getElementById("additional2Used").innerText = expectedValue[9].toLocaleString();
    document.getElementById("additional2Purchase").innerText = Math.max(0, expectedValue[9]-materialPrices[14]).toLocaleString();
    document.getElementById("additional2Gold").innerText = parseInt(Math.max(0, expectedValue[9]-materialPrices[14]) * materialPrices[5]).toLocaleString();
    // 추가재료3
    document.getElementById("additional3Used").innerText = expectedValue[10].toLocaleString();
    document.getElementById("additional3Purchase").innerText = Math.max(0, expectedValue[10]-materialPrices[15]).toLocaleString();
    document.getElementById("additional3Gold").innerText = parseInt(Math.max(0, expectedValue[10]-materialPrices[15]) * materialPrices[6]).toLocaleString();
    // 스크롤 1단계
    document.getElementById("scroll1Used").innerText = expectedValue[11].toLocaleString();
    document.getElementById("scroll1Purchase").innerText = Math.max(0, expectedValue[11]-materialPrices[16]).toLocaleString();
    document.getElementById("scroll1Gold").innerText = parseInt(Math.max(0, expectedValue[11]-materialPrices[16]) * materialPrices[7]).toLocaleString();
    // 스크롤 2단계
    document.getElementById("scroll2Used").innerText = expectedValue[12].toLocaleString();
    document.getElementById("scroll2Purchase").innerText = Math.max(0, expectedValue[12]-materialPrices[17]).toLocaleString();
    document.getElementById("scroll2Gold").innerText = parseInt(Math.max(0, expectedValue[12]-materialPrices[17]) * materialPrices[8]).toLocaleString();
}

function updateResultTableName(typeWeapon, itemTier){
    if(itemTier==3){
        document.getElementById("dolpaseokName").innerText = "찬명돌";
        document.getElementById("abidosName").innerText = "최상레하";
        document.getElementById("pahyeonName").innerText = "명파";
        document.getElementById("additional1Name").innerText = "태양의 은총";
        document.getElementById("additional2Name").innerText = "태양의 축복";
        document.getElementById("additional3Name").innerText = "태양의 가호";
        if(typeWeapon){
            document.getElementById("suhoseokName").innerText = "정파강";
            document.getElementById("scroll1Name").innerText = "야금술 1단계";
            document.getElementById("scroll2Name").innerText = "야금술 2단계";
        }
        else{
            document.getElementById("suhoseokName").innerText = "정수강";
            document.getElementById("scroll1Name").innerText = "재봉술 1단계";
            document.getElementById("scroll2Name").innerText = "재봉술 2단계";
        }
    }
    else{
        document.getElementById("dolpaseokName").innerText = "운명의 돌파석";
        document.getElementById("abidosName").innerText = "아비도스";
        document.getElementById("pahyeonName").innerText = "운명의 파편";
        document.getElementById("additional2Name").innerText = "-";
        document.getElementById("additional3Name").innerText = "-";
        if(typeWeapon){
            document.getElementById("suhoseokName").innerText = "운파";
            document.getElementById("additional1Name").innerText = "용숨";
            document.getElementById("scroll1Name").innerText = "야금술 1단계";
            document.getElementById("scroll2Name").innerText = "야금술 2단계";
        }
        else{
            document.getElementById("suhoseokName").innerText = "운수";
            document.getElementById("additional1Name").innerText = "빙숨";
            document.getElementById("scroll1Name").innerText = "재봉술 1단계";
            document.getElementById("scroll2Name").innerText = "재봉술 2단계";
        }
    }
}

// 총 사용 골드량 계산 함수
function calculateTotalGold(materialPrices, result) {
    let totalGold = result[6];  // 사용 골드량
    totalGold += parseInt(Math.max(0, result[2]-materialPrices[9]) * materialPrices[0]);  // 수호석
    totalGold += parseInt(Math.max(0, result[3]-materialPrices[10]) * materialPrices[1]);  // 돌파석
    totalGold += parseInt(Math.max(0, result[4]-materialPrices[11]) * materialPrices[2]);  // 아비도스
    totalGold += parseInt(Math.max(0, result[5]-materialPrices[12]) * materialPrices[3]);  // 파편
    totalGold += parseInt(Math.max(0, result[8]-materialPrices[13]) * materialPrices[4]);  // 추가재료1
    totalGold += parseInt(Math.max(0, result[9]-materialPrices[14]) * materialPrices[5]);  // 추가재료2
    totalGold += parseInt(Math.max(0, result[10]-materialPrices[15]) * materialPrices[6]);  // 추가재료3
    totalGold += parseInt(Math.max(0, result[11]-materialPrices[16]) * materialPrices[7]);  // 스크롤1단계
    totalGold += parseInt(Math.max(0, result[12]-materialPrices[17]) * materialPrices[8]);  // 스크롤2단계
    return totalGold;
}

// 계산 버튼 클릭 시 이벤트
let simulationFinalResults = [];
document.getElementById("calculateButton").addEventListener("click", function() {
    updateAdvancedRefiningVariables(); // 사용자 입력 강화 설정 적용
    let materialPrices = getMaterialPrice(typeWeapon, itemTier, includeIngredientList); // 재료가격 받아오기
    const epoch = parseInt(document.getElementById("simulationCount").value, 10); // 시뮬레이션 횟수
    //console.log("강화 설정 업데이트", typeWeapon, itemTier, startLv, targetLv, includeIngredientList, additinalSet, scrollSet);
    //console.log("재료 가격", materialPrices);
    
    // 강화 설정 유효성 검사
    let invaildChk = false;
    if(isNaN(startLv) || startLv<0 || startLv>=40) {
        document.getElementById("invaildStartLevel").style = "display:block";
        document.getElementById("startLevel").style = "border-bottom: 3px solid #ee0000;";
        invaildChk = true;
    }
    else{
        document.getElementById("invaildStartLevel").style = "display:none";
        document.getElementById("startLevel").style = "border-bottom: 3px solid #ffffffff;";
    }
    if(isNaN(targetLv) || targetLv<=startLv || targetLv>40) {
        document.getElementById("invaildTargetLevel").style = "display:block";
        document.getElementById("targetLevel").style = "border-bottom: 3px solid #ee0000;";
        invaildChk = true;
    }
    else{
        document.getElementById("invaildTargetLevel").style = "display:none";
        document.getElementById("targetLevel").style = "border-bottom: 3px solid #ffffffff;";
    }
    if(itemTier==3 && targetLv>20) {
        document.getElementById("invaildCalcType").style = "display:block";
        document.getElementById("invaildCalcType").innerText = "3티어 아이템은 20레벨까지만 계산을 지원합니다!";
        invaildChk = true;
    }
    else if(epoch < 100) {
        document.getElementById("invaildCalcType").style = "display:block";
        document.getElementById("invaildCalcType").innerText = "시뮬레이션 횟수는 100 이상이어야 합니다!";
        document.getElementById("simulationCount").style = "border-bottom: 3px solid #ee0000;";
        invaildChk = true;
    }
    else if(epoch>1000000){
        document.getElementById("invaildCalcType").style = "display:block";
        document.getElementById("invaildCalcType").innerText = "시뮬레이션 횟수는 100만 이하여야 합니다!";
        document.getElementById("simulationCount").style = "border-bottom: 3px solid #ee0000;";
        invaildChk = true;
    }
    else{
        document.getElementById("invaildCalcType").style = "display:none";
        document.getElementById("simulationCount").style = "border-bottom: 3px solid #ffffffff;";
    }
    if(invaildChk) return;

    // 각 상재 단계별 몇강 해야하는지 계산
    let phase1Levels = 0, phase2Levels = 0, phase3Levels = 0, phase4Levels = 0;
    for(let i=startLv; i<targetLv; ++i) {
        if(i<10) ++phase1Levels;
        else if(i<20) phase2Levels++;
        else if(i<30) phase3Levels++;
        else phase4Levels++;
    }


    // 시뮬레이션
    let result;
    // 시뮬레이션 결과값을 저장할 배열
    let simulationResults = [];
    for(let i=0; i<epoch; ++i) {
        result = simulation(typeWeapon, itemTier, additinalSet, scrollSet, phase1Levels, phase2Levels, phase3Levels, phase4Levels);
        // result에 총 사용 골드 추가
        const totalGold = calculateTotalGold(materialPrices, result);
        result.push(totalGold);
        // 시뮬레이션 결과값에 추가
        simulationResults.push(result);
    }
    // 결과를 최종 사용 골드량 기준으로 정렬
    simulationResults.sort((a, b) => a[a.length - 1] - b[b.length - 1]);
    // 기대값 출력
    updateResultTable(simulationResults, materialPrices);
    updateResultTableName(typeWeapon, itemTier);
    // 차트값 업데이트
    updateChart(simulationResults);
    simulationFinalResults = simulationResults;
    // 결과예측 입력칸 업데이트
    let setPro = 10;
    document.getElementById("exPro").value = setPro;
    const q = setPro / 100;
    const idx = Math.floor(q * (simulationFinalResults.length - 1));
    const totalGold = simulationFinalResults[idx][13];
    document.getElementById("exGold").value = totalGold.toLocaleString();
});

document.getElementById("exPro").addEventListener("keyup", function() {
    // 시뮬레이션을 아직 돌리지 않았다면 return
    if (!simulationFinalResults || simulationFinalResults.length === 0) {
        document.getElementById("exGold").value = "N/A";
        return;
    }
    
    const inputVal = document.getElementById("exPro").value;
    let numericValue;

    // 숫자(정수 또는 실수)인지 체크
    if (!isNaN(inputVal) && inputVal.trim() !== "") {
        const regex = /^[+-]?(\d+\.?\d*|\.\d+)$/;
        if (regex.test(inputVal)) {
            numericValue = parseFloat(inputVal);
        }
    }

    // 입력값이 유효성 검사(0~100 범위 내의 값)
    if (numericValue !== undefined) {
        if (numericValue < 0 || numericValue > 100) {
            document.getElementById("exGold").value = "";
            return;
        }
    } else {
        document.getElementById("exGold").value = "";
        return;
    }
    
    // 입력 받은 상위% 값을 simulationFinalResults에서 추출하여 결과 도출
    const q = numericValue / 100;
    const idx = Math.floor(q * (simulationFinalResults.length - 1));
    const totalGold = simulationFinalResults[idx][13];
    document.getElementById("exGold").value = totalGold.toLocaleString();
});

document.getElementById("exGold").addEventListener("keyup", function() {
    // 시뮬레이션을 아직 돌리지 않았다면 return
    if (!simulationFinalResults || simulationFinalResults.length === 0) {
        document.getElementById("exPro").value = "N/A";
        return;
    }

    const inputVal = document.getElementById("exGold").value;
    let integerValue; // 정수 값을 저장할 변수

    // 숫자인지 체크
    if (!isNaN(inputVal) && inputVal.trim() !== "") {
        // 정규 표현식을 사용해 정수인지 확인
        const regex = /^[+-]?\d+$/;
        if (regex.test(inputVal)) {
            integerValue = parseInt(inputVal, 10); // 문자열을 정수로 변환
        }
    }

    // 정수값 유효성 검사
    if (integerValue == undefined) {
        document.getElementById("exPro").value = "";
        return;
    }

    // 계산값 표시
    // 입력한 골드보다 같거나 적은 시뮬레이션 결과의 개수를 구합니다.
    const count = Math.max(1, simulationFinalResults.filter(result => result[13] <= integerValue).length);
    // 시뮬레이션 결과의 총 개수와 비교하여 백분율을 계산합니다.
    const percentile = (count / simulationFinalResults.length * 100).toFixed(2);
    document.getElementById("exPro").value = percentile;
});

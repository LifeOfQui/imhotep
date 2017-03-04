import $ from 'jquery';
import './jquery-ui/jquery-ui.min';
// import cardActions from './modules/_cardActions';

let CardObject = {
    'temple': [],
    'burialChamber': []
};

function makeStonesAMess () {
    $('.storage').each(function () {
        $(this).find('.stone').each(function () {
            let deg = Math.round(Math.random() * 7);
            Math.round(Math.random()) !== 1 ? deg *= -1 : deg;
            $(this).css('transform', `rotate(${deg}deg)`);
        });
    });
}

$('.stone').draggable({
    containment: document.querySelector('.boats'),
    revert: 'invalid'
});

const handleStoneDrop = function (event, ui) {
    const stone = ui.draggable;
    const boatSpace = $(this);

    $(stone)
        .detach()
        .css({
            'top': 'auto',
            'left': 'auto',
            'margin': 'auto'
        })
        .draggable( 'disable' )
        .appendTo(boatSpace);

    boatSpace.droppable('disable');

    const boat = boatSpace.closest('.boat');

    const occupiedBoatSpaces = boat.find('.boat__space.ui-droppable-disabled').length;
    if (occupiedBoatSpaces >= 1 && !boat.hasClass('ui-draggable')) {
        boat.draggable({
            containment: document.querySelector('.boats'),
            revert: 'invalid'
        });
    }

    findLastAvailableBoatSpace(boat);
};

function updateCountOfPyramid() {
    $('.pyramidCounter').text(CardObject.pyramidScore.toString());
}

const pyramidScore = [2, 1, 3, 2, 4, 3, 2, 1, 3, 2, 3, 1, 3, 4];
function calculatePyramidScore() {
    let roundPyramidArray = CardObject.pyramidRoundArray;
    
    roundPyramidArray.forEach(function (color) {
        const num = CardObject.playerColors.indexOf(color);
        let score = 1;

        if (pyramidScore[0]) {
            score = pyramidScore[0];
            pyramidScore.shift();
        }

        CardObject.pyramidScore[num] += score;
    });

    updateCountOfPyramid();
}

function updateCountOfTemple() {
    $('.templeCounter').text(CardObject.templeScore.toString());
}

function calculateTempleScore() {
    CardObject.temple.forEach(function (color) {
        const num = CardObject.playerColors.indexOf(color);
        CardObject.templeScore[num] += 1;
    });

    updateCountOfTemple();
}

function updateCountOfObelisk() {
    $('.obeliskCounter').text(CardObject.obelisk.toString());
}

function handleBoatDrop(event, ui) {
    const boat = ui.draggable;
    const droppedOn = $(this);
    $(boat)
        .detach()
        .css({
            'left': 'auto',
            'top': 'auto'
        })
        .appendTo(droppedOn)
        .draggable( 'disable' );

    $(this).droppable( 'disable' );

    $(boat).find('.boat__space').each(function () {
        if($(this).hasClass('ui-droppable')) {
            $(this).droppable('disable');
        }
    });

    let boatCargo = [];
    $(boat).find('.boat__space').each(function () {
        const stone = $(this).children('.stone');
        if (stone.length > 0) {
            const clonedStone = stone.clone();
            clonedStone.removeClass('stone ui-draggable ui-draggable-handle ui-draggable-disabled')
            boatCargo.unshift(clonedStone.attr('class'));
        }
    });

    cardActions(droppedOn.data('port'), CardObject, boatCargo);

    calculatePyramidScore();

    console.log(CardObject);
}

function findLastAvailableBoatSpace(boat) {
    const availableBoatSpaces = $(boat).find('.boat__space:not(.ui-droppable-disabled)');
    if (availableBoatSpaces.length > 0) {
        availableBoatSpaces.last().droppable({
            accept: ".stone",
            activeClass: 'active',
            hoverClass: 'hover',
            drop: handleStoneDrop
        });
    }
}

function initialSetUp() {
    //create object that holds all informations
    CardObject.playerCount = 2;
    CardObject.playerColors = ['gray', 'white'];
    CardObject.pyramidScore = [];
    CardObject.templeScore = [];
    CardObject.obelisk = [];

    for (let i = 0; i < CardObject.playerCount; i++) {
        CardObject.pyramidScore.push(0);
        CardObject.templeScore.push(0);
        CardObject.obelisk.push(0);
    }

    updateCountOfTemple();
    updateCountOfObelisk();

    $('.boat').each(function() {
        findLastAvailableBoatSpace(this);
    });

    $('.port').droppable({
        accept: ".boat",
        activeClass: 'active',
        hoverClass: 'hover',
        drop: handleBoatDrop
    });
}

initialSetUp();
makeStonesAMess();

// TODO wird später bei letztem Schiff pro Runde aufgerufen
$('.endRound').on('click', function () {
    calculateTempleScore();

//    TODO: nach Berechnungen alles wieder auf Anfang setzen
});

const cardActions = function (dropTarget, CardObject, boatCargo) {
    console.log(`Boot ist bei ${dropTarget} gelandet mit ${boatCargo.toString()}.`);

    switch (dropTarget) {
        case 'market':
            break;
        case 'pyramid':
            let pyramidRoundArray = [];
            boatCargo.forEach(function (cargo) {
                pyramidRoundArray.push(cargo);
            });
            CardObject.pyramidRoundArray = pyramidRoundArray;
            break;
        case 'temple':
            // nimm Steine und reih sie von links nach rechts auf
            // if (playerCount < 3) dann bis 5 in einer Reihe sind, ansonsten bis 4
            boatCargo.forEach(function (cargo) {
                CardObject.temple.push(cargo);
                if (CardObject.playerCount < 3) {
                    if (CardObject.temple.length > 4) {
                        CardObject.temple.shift();
                    }
                } else {
                    if (CardObject.temple.length > 5) {
                        CardObject.temple.shift();
                    }
                }
            });
            break;
        case 'obelisk':
            boatCargo.forEach(function (cargo) {
                const num = CardObject.playerColors.indexOf(cargo);
                CardObject.obelisk[num] += 1;
            });
            updateCountOfObelisk();
            break;
        case 'burial-chamber':
            boatCargo.forEach(function (cargo) {
                CardObject.burialChamber.push(cargo);
            });
            break;
        default:
            break;
    }
};
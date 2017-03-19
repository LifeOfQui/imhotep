import $ from 'jquery';
import './jquery-ui/jquery-ui.min';
// import cardActions from './modules/_cardActions';

let roundIndex = 1;
let pyramidRoundArray = [];
let activePlayer = 0;

let Game = {};
let GameScore = {};

let Buffer = {
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

    setNextPlayerActive();
};

const updateCountOfPyramid = () => $('.pyramidCounter').text(GameScore.pyramidScore.toString());

const pyramidScore = [2, 1, 3, 2, 4, 3, 2, 1, 3, 2, 3, 1, 3, 4];
function calculatePyramidScore() {
    pyramidRoundArray.forEach(function (color) {
        const num = Game.playerColors.indexOf(color);
        let score = 1;

        if (pyramidScore[0]) {
            score = pyramidScore[0];
            pyramidScore.shift();
        }

        GameScore.pyramidScore[num] += score;
    });

    updateCountOfPyramid();
    recalculateOverallScore();
}

const updateCountOfTemple = () => $('.templeCounter').text(GameScore.templeScore.toString());

function calculateTempleScore() {
    Buffer.temple.forEach(function (color) {
        const num = Game.playerColors.indexOf(color);
        GameScore.templeScore[num] += 1;
    });

    updateCountOfTemple();
}

function updateCountOfObelisk() {
    $('.obeliskCounter').text(GameScore.obeliskBuffer.toString());
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
            clonedStone.removeClass('stone ui-draggable ui-draggable-handle ui-draggable-disabled');
            boatCargo.unshift(clonedStone.attr('class'));
        }
    });

    cardActions(droppedOn.data('port'), boatCargo);

    setNextPlayerActive();

    if ($('.dock').children().length === 0) {
        endRound();
    }
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

function startupCreateStorages() {
    Game.playerColors.reverse().forEach(function (color) {
        let $storage = $(`<div class="storage storage__${color}"></div>`);
        $('.boatSide').prepend($storage);
        $storage.append(`<button class="storage__newStonesBtn">Get new stones</button>`);
    });

    Game.playerColors.reverse();
}

function startupStonesInStorage() {
    Game.playerColors.forEach(function (color) {
        let storage = $(`.storage__${color}`);
        storage.prepend(`<div class="stone ${color}"></div>`);
        storage.prepend(`<div class="stone ${color}"></div>`);
        storage.prepend(`<div class="stone ${color}"></div>`);
    });
}

function initialGameSetUp() {
    //create object that holds all informations
    //TODO
    activePlayer = 0;
    GameScore.pyramidScore = [];
    GameScore.templeScore = [];
    GameScore.obeliskScore = [];
    GameScore.burialChamberScore = [];
    GameScore.overallScore = [];
    GameScore.obeliskBuffer = [];

    for (let i = 0; i < Game.playerCount; i++) {
        GameScore.pyramidScore.push(0);
        GameScore.templeScore.push(0);
        GameScore.obeliskScore.push(0);
        GameScore.burialChamberScore.push(0);
        GameScore.overallScore.push(0);
        GameScore.obeliskBuffer.push(0);
    }

    startupCreateStorages();
    startupStonesInStorage();

    updateCountOfPyramid();
    updateCountOfTemple();
    updateCountOfObelisk();

    initNewRound();
}

function endOfGame() {
    console.log('End of game!');
}

function setAllPortsDroppable() {
    $('.port').droppable({
        accept: ".boat",
        activeClass: 'active',
        hoverClass: 'hover',
        drop: handleBoatDrop
    }).droppable( "option", "disabled", false );
}

const removeAllBoatsFromPorts = () => $('.port').empty();

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const availableBoats = [4, 4, 3, 3, 3, 2, 2, 1];
function getNewBoatsInDock() {
    let inRoundAvailableBoats = [...availableBoats];
    const randomCountOfBoats = getRandomInt(3, 4);
    for (let i = 0; i < randomCountOfBoats; i++) {
        let boat = $('<div class="boat"></div>');

        const randomCountOfBoatSpace = getRandomInt(1, 4);
        const boatNumber = inRoundAvailableBoats.indexOf(randomCountOfBoatSpace);

        if (boatNumber > -1) {
            inRoundAvailableBoats.splice(boatNumber, 1);
            for(let i = 0; i < randomCountOfBoatSpace; i++) {
                $('<div class="boat__space"></div>').appendTo(boat);
            }
            boat.appendTo('.dock')
        } else {
            i--;
        }
    }
}

function initNewRound() {
    disableAllPlayers();
    console.log('a');
    enableActivePlayer();
    console.log('b');
    removeAllBoatsFromPorts();
    setAllPortsDroppable();
    console.log('c');
    getNewBoatsInDock();
    console.log('d');
    $('.boat').each(function() {
        findLastAvailableBoatSpace(this);
    });
}

function recalculateOverallScore() {
    Game.playerColors.forEach(function (color, idx) {
        console.log(`Recalculating Score for Color ${color} und Playernumber ${idx}`);
        GameScore.overallScore[idx] =
            parseInt(GameScore.pyramidScore[idx])
            + parseInt(GameScore.templeScore[idx])
            + parseInt(GameScore.obeliskScore[idx])
            + parseInt(GameScore.burialChamberScore[idx]);

        $(`.score.${color}`).find('span').text(parseInt(GameScore.overallScore[idx]));
    });
}


function endRound() {
    calculateTempleScore();
    recalculateOverallScore();

    roundIndex++;
    if (roundIndex > 7) {
        alert('Game beendet');
        endOfGame();
    } else {
        alert('Runde beendet');
        initNewRound();
//    TODO: nach Berechnungen alles wieder auf Anfang setzen
    }
}

function updateVisibleTempleStones(visibleStones) {
    $('.visibleTempleStones').empty();

    visibleStones.forEach(function (color) {
        $('<div class="stone"></div>')
            .addClass(color)
            .appendTo('.visibleTempleStones')
    })
}

const cardActions = function (dropTarget, boatCargo) {
    console.log(`Boot ist bei ${dropTarget} gelandet mit ${boatCargo.toString()}.`);

    switch (dropTarget) {
        case 'market':
            break;
        case 'pyramid':
            pyramidRoundArray = [];
            boatCargo.forEach(function (cargo) {
                pyramidRoundArray.push(cargo);
            });
            calculatePyramidScore();
            break;
        case 'temple':
            // nimm Steine und reih sie von links nach rechts auf
            // if (playerCount < 3) dann bis 5 in einer Reihe sind, ansonsten bis 4
            let modulo = 4;

            boatCargo.forEach(function (cargo) {
                if (Game.playerCount >= 3) {
                    modulo = 5;
                }

                Buffer.temple.push(cargo);
                let roundTemple = [...Buffer.temple];

                if (Buffer.temple.length > modulo) {
                    const mod = Buffer.temple.length % modulo;
                    let lastFour = roundTemple.splice(roundTemple.length - modulo);

                    roundTemple = lastFour.splice(lastFour.length - mod).concat(lastFour);
                }

                updateVisibleTempleStones(roundTemple);
            });
            break;
        case 'obelisk':
            boatCargo.forEach(function (cargo) {
                const num = Game.playerColors.indexOf(cargo);
                GameScore.obeliskBuffer[num] += 1;
            });
            updateCountOfObelisk();
            break;
        case 'burial-chamber':
            boatCargo.forEach(function (cargo) {
                Buffer.burialChamber.push(cargo);
            });
            break;
        default:
            break;
    }
};

function makeStonesDraggable() {
    $('.storage .stone').draggable({
        containment: document.querySelector('.boats'),
        revert: 'invalid'
    });
}

function disableAllPlayers() {
    makeStonesDraggable();

    $('.storage').css({
        'border': '1px solid transparent'
    });

    $('.storage .stone')
        .css({})
        .draggable( 'disable' );

    $(`.storage button`).unbind('click');
}

function enableActivePlayer() {
    const activePlayerColor = Game.playerColors[activePlayer];

    $(`.storage__${activePlayerColor}`).css({
        'border': '1px solid red'
    });

    $(`.storage__${activePlayerColor} .stone`)
        .draggable('enable');

    $(`.storage__${activePlayerColor} button`).on('click', function () {
        getNewStones();
    });
}

function setNextPlayerActive() {
    activePlayer++;
    if (activePlayer > (Game.playerCount - 1)) {
        activePlayer = 0;
    }

    disableAllPlayers();
    enableActivePlayer();
}

function getNewStones() {
    const activePlayerColor = Game.playerColors[activePlayer];
    const activePlayerStorage = $(`.storage__${activePlayerColor}`);
    const stones = $(activePlayerStorage).find('.stone');
    //max 3 Steine

    const stonesToGet = Math.min((5 - stones.length), 3);
    if (stonesToGet === 0) {
        alert('Du kannst keine Steine nehmen.');
        return false;
    }

    for (let i = 0; i < stonesToGet; i++) {
        activePlayerStorage.prepend(`<div class="stone ${activePlayerColor}"></div>`);
    }

    makeStonesAMess();
    setNextPlayerActive();
}

function handleColorChoser(event, ui) {
    var $dock = $(this);

    // get draggedFromDock here, cause $originalItem will be detached in emptyDock()
    var $originalItem = $(ui.draggable);
    var draggedFromSlot = !$originalItem.closest('.dock').length;
    var itemidx = $originalItem.data('itemidx');

    // check if just redragged to the same dock
    if (!draggedFromSlot) {
        var ocuppiedItemIndex = $dock.children('.stone').data('itemidx');
        if (itemidx === ocuppiedItemIndex) {
            return;
        }
    }

    // Empty the dock
    _emptyDock($dock);

    // Clone the item and add to the dock
    var $item = $originalItem.clone(false);
    $item.data('itemidx', itemidx);
    $item.appendTo($dock);

    if (draggedFromSlot) {
        $originalItem.draggable('option', 'disabled', true);
    } else { // if re-dragged from another dock
        $originalItem.remove();
    }

    // Configure re-dragging of items from dock to dock
    _configureRedragging($item, '.settings');
}

function _configureRedragging($item, $container) {
    $item.draggable({
        containment: $container,
        revert: 'invalid',
        helper: 'clone'
    });
}

function showSettings() {
    $('.settings .stone').draggable({
        containment: document.querySelector('.settings'),
        revert: 'invalid',
        helper: 'clone'
    }).droppable({
        accept: '.color-choser .stone',
        activeClass: 'active',
        hoverClass: 'hover',
        drop: function(event, ui) {
            const $originalItem = $(ui.draggable);
            const itemidx = $originalItem.data('itemidx');

            // remove the item from the dock
            $originalItem.remove();

            // reactivate the corresponding item in the slot
            _findSlotItemByIndex(itemidx).draggable('option', 'disabled', false);
        }
    });

    $('.color-choser').droppable({
        accept: ".stone",
        activeClass: 'active',
        hoverClass: 'hover',
        drop: handleColorChoser
    });
}

function _emptyDock($dock) {
    $dock.children('.stone').each(function () {
        const $item = $(this);
        const itemidx = $item.data('itemidx');
        $item.remove();

        _findSlotItemByIndex(itemidx).draggable('option', 'disabled', false);
    });
}

function _findSlotItemByIndex(itemidx) {
    let $item = $();
    $('.settings').find('.stone').each(function () {
        if ($(this).data('itemidx') == itemidx) {
            $item = $(this);
            return false;
        }
    });
    return $item;
}

$('.startGameBtn').on('click', function () {
    Game.playerNames = [];
    Game.playerColors = ['gray', 'white'];
    Game.playerCount = 0;
    $('.playerName').each(function () {
        if ($(this).val() !== '') {
            //&& $(this).next('.color-choser').children().length > 0) {
            Game.playerNames.push($(this).val());
            // Game.playerColors.push();
        }
    });

    Game.playerCount = Game.playerNames.length;

    if (Game.playerCount < 2) {
        alert('Nicht genug Spieler oder Farben angegeben');
        return;
    }

    $('.settings').hide();

    initialGameSetUp();
    makeStonesAMess();
});

showSettings();
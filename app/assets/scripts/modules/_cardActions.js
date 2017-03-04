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

export default cardActions;
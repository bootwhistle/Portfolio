
class Character {
    constructor(name, health, attackPower) {
        this.name = name;
        this.health = health;
        this.attackPower = attackPower;
        this.inventory = [];
        this.currentLocation = null;
    }

    attack(target) {
        if (target.health <= 0) {
            return `${target.name} is defeated!`;
        }
        target.takeDamage(this.attackPower);
        return `${this.name} attacks ${target.name} for ${this.attackPower} damage!`;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    pickUpItem(itemName) {
               
        // Use lodash to find the item in the location
        const item = _.find(this.currentLocation.items, 
        i => i.name.toLowerCase() === itemName.toLowerCase());
                
        if (item) {
            this.inventory.push(item);
            // item is held in locatin, the _.remove method from lodash to move
            _.remove(this.currentLocation.items, i => i === item);
                return `You picked up ${item.name}!`;
            } else {
                return `There's no ${itemName} here.`;
        }

    }

    viewInventory() {
        if (this.inventory.length === 0) {
            return "Your inventory is empty.";
        }
        // Use lodash to map items to their names
        const itemList = _.map(this.inventory, 'name').join(', ');
        return `Inventory: ${itemList}`;
    }

    useItem(itemName) {
        const item = _.find(this.inventory, 
        i => i.name.toLowerCase() === itemName.toLowerCase());
                
        if (!item) {
            return `You don't have ${itemName} in your inventory.`;
        }

        let result = "";
        if (item.type === "healing") {
            this.health += item.value;
            result = `You used ${item.name} and restored ${item.value} health! Current health: ${this.health}`;
            _.remove(this.inventory, i => i === item);
        } else if (item.type === "weapon") {
            this.attackPower += item.value;
             result = `You equipped ${item.name}! Attack power increased by ${item.value}!`;
        } else if (item.type === "quest") {
            result = `You examine ${item.name}. ${item.description || 'It seems important.'}`;
        }
        return result;
    }


}


class Item {
    constructor(name, type, value, description = "") {
        this.name =name;
        this.type = type; //weapon, healing, quest, junk?
        this.value = value;
        this.description = description;
    }
}
 

class Location {
    constructor(name, description, connectedLocations ={}){
        this.name = name;
        this.description = description;
        this.items = [];
        this.characters = [];
        this.connectedLocations = connectedLocations;
    }

    enterLocation(character){
        character.currentLocation = this;
        return `\n=== ${this.name} ===\n${this.description}`
    }

    searchLocation(){
        let result = `\nYou search ${this.name}...\n`;
                
        // Use lodash to filter and display items
        if (this.items.length > 0) {
            const itemNames = _.map(this.items, 'name').join(', ');
            result += `Items: ${itemNames}\n`;
        } else {
            result += "No items here.\n";
        }

        const livingChars = _.filter(this.characters, c => c.health > 0);
        if (livingChars.length > 0) {
            const charNames = _.map(livingChars, 'name').join(', ');
            result += `Characters: ${charNames}\n`;
        }

        // Show available exits
        const exits = Object.keys(this.connectedLocations).join(', ');
        if (exits) {
            result += `Exits: ${exits}`;
        }

        return result;
    }

    move(direction, character) {
        const newLocation = this.connectedLocations[direction.toLowerCase()];
                
        if (newLocation) {
            return newLocation.enterLocation(character);
        } else {
            return `You can't go ${direction} from here.`;
        }
    }

}

//characters

const player = new Character("Player", 100, 20);
const goblin = new Character("Goblin", 20, 10);
const prosecutor = new Character("Prosecutor", 50, 10); // set up the Prosecutor and Defendor as enemy/helper if possible
const defender = new Character("Defender", 50, 10);

//locations setup, could have set up as an array of locations
const entrance = new Location(
    "Dungeon Entrance", "You stand in front of a large stone archway leading to somewhere unknown, you try peering past thestones but you can only see unending darkness returning no light or sound, only a rhythmic flow of air back and forth as if the structure is breathing."
);

const hall1 = new Location(
    "Dark passage", "You continue down a barely visible hallway that leads further in while light from the entrance fades into a pale glow."
);

const hall2 = new Location(
    "Darker passage", "The passageway continues on further into the cave"
);

const intersection = new Location(
    "Intersection", "The passageway opens up into a T-intersection, there is a path leading back to the entrance and the main tunnel goes ot the left and right. The ground is well worn and you see signs of travel along the tunnel."
);

const circleRoom = new Location(
    "Chamber", "You are in a moderately sized chamber that is like a half sphere, the walls are covered in rather crude (actually rude) drawings painted with some uknown smelly brown paste"
);

const doorRoom = new Location(
    "Kitchen", "You find yourself in what appears to be a kitche, there is a small table with one place setting and various strage and cooking devices lining the walls of the tunnel. There is a door to the north, behind which you hear a lot of gutteral noises." 
);

const gobLair = new Location(
    "Lair", "You are in a brightly lit room with stacks of paper surrounding a desk, behind which you can detect an unusual presence."
);

const courtRoom = new Location(
    "Court", "You are in a large room, seated at a desk. The room is lined with benches seating an uncountable number of goblins jeering and huring insults at you. Now you must defend yourself against the prosecutor, as you have been charged with murder most foul!"
);

//items, so a sword, businessCard, torch, health potion
const sword = new Item("Sword", "weapon", 15, "A sharp blade that increases attack power");
const healthPotion = new Item("Health Potion", "healing", 30, "Restores 30 HP");
const torch = new Item("Torch", "quest", 0, "Illuminates dark places");
const businessCard = new Item("Business Card", "quest", 0, "A lawyer's business card with strange symbols");
const magicScroll = new Item("Magic Scroll", "quest", 0, "An ancient scroll with the secret to defeating the Prosecutor");

//connecting locations:
entrance.connectedLocations = { north: hall1}; 
hall1.connectedLocations = {north: hall2, south: entrance};
hall2.connectedLocations = {north: intersection, south: hall1};
intersection.connectedLocations = {south: hall2, west: circleRoom, east: doorRoom}
circleRoom.connectedLocations = {east: intersection};
doorRoom.connectedLocations = {west: intersection, north: gobLair};
gobLair.connectedLocations = {south: doorRoom};


//set item/NPC locations
entrance.items.push(torch);
intersection.items.push(businessCard);
courtRoom.characters.push(prosecutor);
courtRoom.characters.push(defender);
doorRoom.items.push(sword);
doorRoom.items.push(healthPotion);
gobLair.characters.push(goblin);
circleRoom.items.push(magicScroll);

//put player at the entrance
entrance.enterLocation(player);

let gameRunning = false;

//game output thingies
function displayOutput(text) {
    const output = document.getElementById('output');
    output.innerHTML += `<p>${text}</p>`;
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

function parseCommand(command) {
    command = command.toLowerCase().trim();


    // Check for lose condition
    if (player.health <= 0) {
        displayOutput("<span class='error'>GAME OVER! You have been defeated!</span>");
        displayOutput("Refresh the page to try again.");
        gameRunning = false;
        document.getElementById('input-container').style.display = 'none';
        return;
    }

    // Define command options - added to make it easier to have multiple inputs
    const lookCommands = ["look", "search", "examine", "l"];
    const inventoryCommands = ["inventory", "inv", "i", "bag", "items"];
    const moveCommands = ["move", "go", "walk", "travel", "head"];
    const pickupCommands = ["pick up", "take", "grab", "get", "pickup"];
    const useCommands = ["use", "equip", "hold", "wield"];
    const attackCommands = ["attack", "fight", "hit", "strike", "kill"];

    let result = "";

    // Parse different command types using arrays
    if (lookCommands.includes(command)) {
        result = player.currentLocation.searchLocation();
    } 
    else if (inventoryCommands.includes(command)) {
        result = player.viewInventory();
        result += `\nHealth: ${player.health} | Attack: ${player.attackPower}`;
    }
    else if (moveCommands.some(cmd => command.startsWith(cmd + " "))) {
        // Find which command was used
        const usedCommand = moveCommands.find(cmd => command.startsWith(cmd + " "));
        const direction = command.replace(usedCommand + " ", "");
        result = player.currentLocation.move(direction, player);
    }
    else if (pickupCommands.some(cmd => command.startsWith(cmd + " "))) {
        // Find which command was used
        const usedCommand = pickupCommands.find(cmd => command.startsWith(cmd + " "));
        const itemName = command.replace(usedCommand + " ", "");
        result = player.pickUpItem(itemName);
    }
    else if (useCommands.some(cmd => command.startsWith(cmd + " "))) {
        // Find which command was used
        const usedCommand = useCommands.find(cmd => command.startsWith(cmd + " "));
        const itemName = command.replace(usedCommand + " ", "");
        result = player.useItem(itemName);
    }
    else if (attackCommands.some(cmd => command.startsWith(cmd + " "))) {
        // Find which command was used
        const usedCommand = attackCommands.find(cmd => command.startsWith(cmd + " "));
        const targetName = command.replace(usedCommand + " ", "");
        
        // Use lodash to find the target character in current location
        const target = _.find(player.currentLocation.characters, 
            c => c.name.toLowerCase() === targetName.toLowerCase());
                
        if (target && target.health > 0) {
            result = player.attack(target);
                    
            if (target.health > 0) {
                result += `\n${target.attack(player)}`;
                result += `\n${target.name}: ${target.health} HP | You: ${player.health} HP`;
            } else {
                result += `\n${target.name} has been defeated!`;
        
                // If the goblin is defeated, teleport to courtroom
                if (target.name === "Goblin") {
                    result += `\n\nThe ground shakes beneath your feet!`;
                    result += `\nA portal opens and you are sucked through...`;
                    result += courtRoom.enterLocation(player);
                    result += `\n\nYou have been transported to the Court!`;
                    result += player.currentLocation.searchLocation();
                }
                
                // If the prosecutor is defeated, trigger win immediately
                if (target.name === "Prosecutor") {
                    displayOutput(`<span class='command'>> ${command}</span>`);
                    displayOutput(result);
                    displayOutput("<span class='success'>VICTORY! You have defeated the Prosecutor and saved yourself... yay?!</span>");
                    displayOutput("Thanks for playing! Refresh to play again.");
                    gameRunning = false;
                    document.getElementById('input-container').style.display = 'none';
                    return;
                }
            }
        } else if (target && target.health <= 0) {
            result = `${targetName} is already defeated.`;
        } else {
            result = `There's no ${targetName} here to attack.`;
        }
    }
    else if (command === "help") {
        result = `
            Commands:
            - look/search/examine/l: Examine your surroundings
            - move/go/walk [direction]: Move in a direction 
              (north, south, east, west)
            - inventory/inv/i/bag: Check your inventory and stats
            - pick up/take/grab/get [item]: Pick up an item
            - use/consume/equip [item]: Use an item from your inventory
            - attack/fight/hit/strike [character]: Attack a character
            - help: Show this help message
        `;
    }
    else {
        result = `Unknown command: "${command}". Type "help" for available commands.`;
    }

    displayOutput(`<span class='command'>> ${command}</span>`);
    displayOutput(result);
}

function submitCommand() {
    if (!gameRunning) return;
    
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    
    if (command) {
        parseCommand(command);
        input.value = '';
    }
    
    input.focus();
}

        // Allow Enter key to submit
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('command-input');
    input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitCommand();
    }
    });
});

function startGame() {
    clearOutput();
    gameRunning = true;
    
    // Hide start button, show input
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('input-container').style.display = 'block';
    
    displayOutput("<h2>Welcome to Scriptoria!</h2>");
    displayOutput("You are a hero who must navigate the mysterious land of Scriptoria.");
    displayOutput("Your goal: Explore the dark caverns for riches and glory!");
    displayOutput("Collect items, fight enemies, and explore to succeed!");
    displayOutput("=====================================\n");
    displayOutput(entrance.enterLocation(player));
    displayOutput(player.currentLocation.searchLocation());
    displayOutput("\nType 'help' to see available commands.");
    
    // Focus on input box
    document.getElementById('command-input').focus();
}

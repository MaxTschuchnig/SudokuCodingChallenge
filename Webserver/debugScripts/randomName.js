const adjectives = [
  'Wobbly', 'Sassy', 'Jumpy', 'Sneaky', 'Chunky', 'Zesty', 'Fluffy', 'Drowsy',
  'Spicy', 'Giggly', 'Mysterious', 'Slippery', 'Grumpy', 'Nervous', 'Redundant',
  'Bouncy', 'Clumsy', 'Crispy', 'Fuzzy', 'Noisy', 'Puzzled', 'Quirky', 'Wacky',
  'Raspy', 'Squeaky', 'Tipsy', 'Whimsical', 'Whiny', 'Lazy', 'Fidgety', 'Loopy',
  'Frisky', 'Goofy', 'Dizzy', 'Odd', 'Zany', 'Wacky', 'Bossy', 'Greedy',
  'Plucky', 'Prickly', 'Scrawny', 'Tiny', 'Pompous', 'Mighty', 'Shifty', 'Glum',
  'Silly', 'Rusty', 'Cheeky', 'Feisty', 'Scruffy', 'Peculiar', 'Quaint',
  'Bashful', 'Rowdy', 'Huffy', 'Flashy', 'Icy', 'Nifty', 'Tacky', 'Sleepy',
  'Cuddly', 'Soggy', 'Cranky', 'Witty', 'Peppy', 'Breezy', 'Sketchy', 'Zippy',
  'Twitchy', 'Groggy', 'Scratchy', 'Snappy', 'Snooty', 'Gloomy', 'Spritely',
  'Topsy-Turvy', 'Gigantic', 'Weird', 'Frothy', 'Stuffy', 'Puffy', 'Tipsy',
  'Mushy', 'Bumpy', 'Jolly', 'Nutty', 'Smudgy', 'Shaky', 'Swirly', 'Quivery',
  'Frumpy', 'Squishy', 'Knobbly', 'Knotted', 'Fumbling', 'Tangled', 'Drifty',
  'Frantic', 'Whirly', 'Hazy', 'Snuggly', 'Creaky', 'Dapper'
]

const nouns = [
  'Otter', 'Pickle', 'Banana', 'Pirate', 'Cactus', 'Duckling', 'Hedgehog',
  'Pancake', 'Wizard', 'Taco', 'Ninja', 'Pigeon', 'Lobster', 'Cupcake', 'Sock',
  'Walrus', 'Muffin', 'Hamster', 'Platypus', 'Butterfly', 'Koala', 'Peanut',
  'Meerkat', 'Marshmallow', 'Squirrel', 'Doughnut', 'Puffin', 'Sloth', 'Unicorn',
  'Pelican', 'Penguin', 'Mongoose', 'Raccoon', 'Squid', 'Crab', 'Toad', 'Newt',
  'Giraffe', 'Marmoset', 'Kangaroo', 'Parrot', 'Marmalade', 'Chinchilla', 'Llama',
  'Beetle', 'Tortoise', 'Blobfish', 'Octopus', 'Cabbage', 'Zebra', 'Carrot',
  'Chipmunk', 'Gnome', 'Pixie', 'Gremlin', 'Frog', 'Walnut', 'Salamander', 'AI',
  'Jellybean', 'Crumpet', 'Alpaca', 'Kiwi', 'Puffball', 'Guppy', 'Squash', 'Al',
  'Bean', 'Mole', 'Woodpecker', 'Hummingbird', 'Seahorse', 'Tadpole', 'Beaver',
  'Mule', 'Goose', 'Peacock', 'Parakeet', 'Ferret', 'Truffle', 'Turnip', 'Raven',
  'Scarecrow', 'Fawn', 'Heron', 'Badger', 'Weasel', 'Otterpop', 'Churro', 'Brisket',
  'Tarantula', 'Dachshund', 'Gecko', 'Stingray', 'Seaweed', 'Crayfish', 'Puffin',
  'Rutabaga', 'Tortilla', 'Sprout', 'Dumpling', 'Pudding', 'Salmon', 'Clam',
  'Oyster', 'Tuna', 'Fritter', 'Pretzel', 'Scone'
]

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

for (let i = 0; i < 100; i++) {
  console.log(`${getRandomElement(adjectives)} ${getRandomElement(nouns)}`)
}

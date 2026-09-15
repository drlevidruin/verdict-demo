// Presentation data and types adapted for the public fictional demo.

// The Verdict topic deck. 150 clean, funny, genuinely debatable statements.
// `text` is the statement itself and doubles as the TRUE side's claim.
// `counter` is the hand-written opposing claim shown to the FALSE side, so a
// player always reads the exact position they must argue, negation included,
// with zero ambiguity.

export type TopicCategory =
  | 'Food fights'
  | 'Everyday life'
  | 'Absurd arguments'
  | 'Friends and family'
  | 'Work-life dilemmas'
  | 'Big ideas';

export interface Topic {
  id: string;
  version: number;
  title: string;
  text: string;
  counter: string;
  category: TopicCategory;
  tags: string[];
  readingDifficulty: 'easy' | 'standard';
  tone: 'playful' | 'thoughtful';
  audience: 'general';
  estimatedSeconds: 60 | 90;
  allowedModes: Array<'quickPlay' | 'practice'>;
  editorialStatus: 'published';
  visibility: 'public';
  featured: boolean;
}

type BaseTopic = Pick<Topic, 'id' | 'text' | 'counter'>;

const BASE_TOPICS: BaseTopic[] = [
  { id: 't01', text: 'Cereal is a soup.', counter: 'Cereal is not a soup.' },
  { id: 't02', text: 'A hot dog is a sandwich.', counter: 'A hot dog is not a sandwich.' },
  { id: 't03', text: 'Pineapple belongs on pizza.', counter: 'Pineapple does not belong on pizza.' },
  { id: 't04', text: 'It is acceptable to recline your airplane seat.', counter: 'It is not acceptable to recline your airplane seat.' },
  { id: 't05', text: 'The book is always better than the movie.', counter: 'The movie is often better than the book.' },
  { id: 't06', text: 'Breakfast food is appropriate at any hour.', counter: 'Breakfast food belongs at breakfast only.' },
  { id: 't07', text: 'Board games are better than video games.', counter: 'Video games are better than board games.' },
  { id: 't08', text: 'Socks with sandals should be normalized.', counter: 'Socks with sandals should never be normalized.' },
  { id: 't09', text: 'A straw has two holes.', counter: 'A straw has exactly one hole.' },
  { id: 't10', text: 'Water is wet.', counter: 'Water is not wet.' },
  { id: 't11', text: 'Dogs are better roommates than cats.', counter: 'Cats are better roommates than dogs.' },
  { id: 't12', text: 'Ketchup belongs in the fridge.', counter: 'Ketchup belongs in the pantry, not the fridge.' },
  { id: 't13', text: 'Toilet paper should hang over the roll, not under.', counter: 'Toilet paper should hang under the roll, not over.' },
  { id: 't14', text: 'Dessert should be eaten before dinner.', counter: 'Dessert must wait until after dinner.' },
  { id: 't15', text: 'A Pop-Tart is a ravioli.', counter: 'A Pop-Tart is not a ravioli.' },
  { id: 't16', text: 'Cake is superior to pie.', counter: 'Pie is superior to cake.' },
  { id: 't17', text: 'Winter is better than summer.', counter: 'Summer is better than winter.' },
  { id: 't18', text: 'Die Hard is a Christmas movie.', counter: 'Die Hard is not a Christmas movie.' },
  { id: 't19', text: 'The middle seat deserves both armrests.', counter: 'The middle seat does not deserve both armrests.' },
  { id: 't20', text: 'Leftovers taste better than the original meal.', counter: 'The original meal tastes better than the leftovers.' },
  { id: 't21', text: 'It is fine to wear pajamas to the grocery store.', counter: 'It is not fine to wear pajamas to the grocery store.' },
  { id: 't22', text: 'Double dipping is acceptable among close friends.', counter: 'Double dipping is never acceptable, even among close friends.' },
  { id: 't23', text: 'Monday is secretly the best day of the week.', counter: 'Monday is the worst day of the week.' },
  { id: 't24', text: 'Aliens definitely exist.', counter: 'Aliens do not exist.' },
  { id: 't25', text: 'A burrito is a sandwich.', counter: 'A burrito is not a sandwich.' },
  { id: 't26', text: 'Cold pizza is better than hot pizza.', counter: 'Hot pizza is better than cold pizza.' },
  { id: 't27', text: 'The back row is the best row in a movie theater.', counter: 'The back row is not the best row in a movie theater.' },
  { id: 't28', text: 'Smooth peanut butter beats crunchy peanut butter.', counter: 'Crunchy peanut butter beats smooth peanut butter.' },
  { id: 't29', text: 'Restaurants should be banned from singing happy birthday.', counter: 'Restaurants should keep singing happy birthday.' },
  { id: 't30', text: 'GIF is pronounced with a hard G.', counter: 'GIF is pronounced with a soft G, like the peanut butter.' },
  { id: 't31', text: 'Cats secretly understand everything we say.', counter: 'Cats have no idea what we are saying.' },
  { id: 't32', text: 'The five second rule is scientifically valid.', counter: 'The five second rule is not valid, not even for one second.' },
  { id: 't33', text: 'Napping is a productivity strategy.', counter: 'Napping is not a productivity strategy.' },
  { id: 't34', text: 'Cargo shorts are a bold fashion statement.', counter: 'Cargo shorts are a fashion mistake.' },
  { id: 't35', text: 'The crust is the best part of the pizza.', counter: 'The crust is the worst part of the pizza.' },
  { id: 't36', text: 'Milk goes in the bowl before the cereal.', counter: 'Cereal goes in the bowl before the milk.' },
  { id: 't37', text: 'A quesadilla is just a Mexican grilled cheese.', counter: 'A quesadilla is not just a Mexican grilled cheese.' },
  { id: 't38', text: 'Every meeting could have been an email.', counter: 'Meetings accomplish things an email never could.' },
  { id: 't39', text: 'Air guitar is a legitimate musical instrument.', counter: 'Air guitar is not a musical instrument.' },
  { id: 't40', text: 'Building a sandcastle counts as owning real estate.', counter: 'Building a sandcastle does not make you a property owner.' },
  { id: 't41', text: 'The muffin top is the only part of the muffin worth eating.', counter: 'The whole muffin is worth eating, not just the top.' },
  { id: 't42', text: 'Pigeons are just city chickens.', counter: 'Pigeons are not city chickens.' },
  { id: 't43', text: 'Everyone should own at least one cape.', counter: 'Nobody needs to own a cape.' },
  { id: 't44', text: 'Soup is a beverage.', counter: 'Soup is not a beverage.' },
  { id: 't45', text: 'French fries count as a salad.', counter: 'French fries do not count as a salad.' },
  { id: 't46', text: 'Every family has one true owner of the TV remote.', counter: 'The TV remote belongs to everyone equally.' },
  { id: 't47', text: 'Pluto should still count as a planet.', counter: 'Pluto is not a planet, and the astronomers were right.' },
  { id: 't48', text: 'Waffles are superior to pancakes.', counter: 'Pancakes are superior to waffles.' },
  { id: 't49', text: 'A thermos is a lunchbox for liquids.', counter: 'A thermos is not a lunchbox for liquids.' },
  { id: 't50', text: 'Shopping carts are the ultimate test of moral character.', counter: 'Shopping carts prove nothing about moral character.' },

  // Food fights
  { id: 't51', text: 'Ranch belongs on pizza.', counter: 'Ranch has no business anywhere near a pizza.' },
  { id: 't52', text: 'Raisin cookies that look like chocolate chip cookies are a betrayal.', counter: 'A raisin cookie owes you nothing.' },
  { id: 't53', text: 'Soggy cereal is ruined cereal.', counter: 'Soggy cereal is cereal at its peak.' },
  { id: 't54', text: 'The last slice belongs to whoever paid.', counter: 'The last slice belongs to whoever grabs it first.' },
  { id: 't55', text: 'Well-done steak is a perfectly valid choice.', counter: 'Well-done steak is a tragedy on a plate.' },
  { id: 't56', text: 'Chocolate is better than vanilla.', counter: 'Vanilla is better than chocolate.' },
  { id: 't57', text: 'A smoothie counts as a meal.', counter: 'A smoothie is a drink, not a meal.' },
  { id: 't58', text: 'Cake batter is better than baked cake.', counter: 'Baked cake beats batter every time.' },
  { id: 't59', text: 'Sandwiches taste better cut diagonally.', counter: 'Cutting changes nothing about a sandwich.' },
  { id: 't60', text: 'Watermelon is the most overrated fruit.', counter: 'Watermelon deserves its crown.' },
  { id: 't61', text: 'Nacho cheese is real cheese.', counter: 'Nacho cheese is a cheese-adjacent substance.' },
  { id: 't62', text: 'Ketchup on eggs is elite.', counter: 'Ketchup ruins eggs.' },
  { id: 't63', text: 'The end pieces of a loaf of bread are the best pieces.', counter: 'The end pieces are just the packaging of the loaf.' },
  { id: 't64', text: 'Breakfast for dinner beats dinner for breakfast.', counter: 'Dinner for breakfast is the true power move.' },
  { id: 't65', text: 'A corn dog is superior to a hot dog.', counter: 'A hot dog needs no costume.' },
  { id: 't66', text: 'Pickles improve every sandwich.', counter: 'Pickles are sandwich saboteurs.' },
  { id: 't67', text: 'Sparkling water is better than still water.', counter: 'Still water is better than sparkling water.' },
  { id: 't68', text: 'The microwave is the most important kitchen appliance.', counter: 'The stove is the most important kitchen appliance.' },
  { id: 't69', text: 'Mac and cheese is a main dish.', counter: 'Mac and cheese is a side dish.' },
  { id: 't70', text: 'Candy corn is delicious.', counter: 'Candy corn is edible decoration at best.' },
  { id: 't71', text: 'A milkshake requires a spoon.', counter: 'A milkshake is a drink, so use the straw.' },
  { id: 't72', text: 'Guacamole is worth the extra charge.', counter: 'Guacamole is never worth the extra charge.' },
  { id: 't73', text: 'Cheesecake is a pie, not a cake.', counter: 'Cheesecake is a cake, it says so in the name.' },
  { id: 't74', text: 'A calzone is just a folded pizza.', counter: 'A calzone is fundamentally not a pizza.' },
  { id: 't75', text: 'White chocolate is real chocolate.', counter: 'White chocolate is an imposter.' },
  { id: 't76', text: 'French fries belong dipped in a milkshake.', counter: 'Fries and milkshakes must never touch.' },
  { id: 't77', text: 'Soup in a bread bowl is the best soup delivery system.', counter: 'The bread bowl is a soggy gimmick.' },
  { id: 't78', text: 'Popcorn is the best movie snack.', counter: 'Popcorn is the most overrated movie snack.' },
  { id: 't79', text: 'Ice cream is better in a cup than a cone.', counter: 'The cone is the whole point of ice cream.' },
  { id: 't80', text: 'Spicy food is worth the pain.', counter: 'No flavor is worth suffering for.' },

  // Etiquette and everyday life
  { id: 't81', text: 'Phones should be banned at the dinner table.', counter: 'Phones at the dinner table are fine in moderation.' },
  { id: 't82', text: 'The person by the window controls the shade.', counter: 'The window shade belongs to the whole row.' },
  { id: 't83', text: 'Shoes off at the door should be the rule in every home.', counter: 'Shoes stay on unless the host insists.' },
  { id: 't84', text: 'It is fine to take the last piece of shared food without asking.', counter: 'You must always offer the last piece.' },
  { id: 't85', text: 'Speakerphone in public should be a finable offense.', counter: 'Speakerphone in public is nobody else’s business.' },
  { id: 't86', text: 'Gift cards are thoughtful gifts.', counter: 'Gift cards are giving up with extra steps.' },
  { id: 't87', text: 'Regifting is completely acceptable.', counter: 'Regifting is a betrayal of the original giver.' },
  { id: 't88', text: 'Small talk is a gift to society.', counter: 'Small talk is a tax on society.' },
  { id: 't89', text: 'Being early is the same as being on time.', counter: 'Being early is its own kind of rude.' },
  { id: 't90', text: 'Once you claim a couch seat, it is yours forever.', counter: 'Couch seats reset every time you stand up.' },
  { id: 't91', text: 'Singing in the car with passengers is a right.', counter: 'Singing in the car is a privilege your passengers grant.' },
  { id: 't92', text: 'Wearing the band’s shirt to their concert is the correct move.', counter: 'Wearing the band’s shirt to their concert is trying too hard.' },
  { id: 't93', text: 'Leaving a group chat without explanation is acceptable.', counter: 'You owe the group chat a goodbye.' },
  { id: 't94', text: 'Voice messages are better than texting.', counter: 'Voice messages are a burden on the receiver.' },
  { id: 't95', text: 'It is fine to double-book plans and decide later.', counter: 'Double-booking plans is lying twice.' },
  { id: 't96', text: 'A made bed makes the whole room feel clean.', counter: 'A made bed fools no one.' },
  { id: 't97', text: 'Hitting snooze is self-care.', counter: 'Hitting snooze is stealing sleep from yourself.' },
  { id: 't98', text: 'Socks in bed are cozy.', counter: 'Socks in bed are a crime against comfort.' },
  { id: 't99', text: 'The correct number of pillows on a bed is two.', counter: 'A bed needs a mountain of pillows.' },
  { id: 't100', text: 'Toothpaste must be squeezed from the bottom.', counter: 'Squeeze the toothpaste anywhere, it all comes out.' },

  // Taxonomy and absurd claims
  { id: 't101', text: 'Lasagna is just Italian casserole.', counter: 'Lasagna transcends the casserole label.' },
  { id: 't102', text: 'Every filled pasta is a dumpling.', counter: 'Pasta and dumplings are different civilizations.' },
  { id: 't103', text: 'A horse is basically a very large dog.', counter: 'A horse is nothing like a dog.' },
  { id: 't104', text: 'Golf is a sport.', counter: 'Golf is a hobby with expensive walking.' },
  { id: 't105', text: 'Cheerleading is a sport.', counter: 'Cheerleading is a performance, not a sport.' },
  { id: 't106', text: 'Chess is a sport.', counter: 'Chess is a game, not a sport.' },
  { id: 't107', text: 'Buying books counts as a hobby even if you never read them.', counter: 'Unread books are just decor.' },
  { id: 't108', text: 'A hoodie counts as a jacket.', counter: 'A hoodie is not a jacket.' },
  { id: 't109', text: 'Crocs deserve a place in every closet.', counter: 'Crocs belong only in gardens and hospitals.' },
  { id: 't110', text: 'A futon is a bed.', counter: 'A futon is not a real bed.' },
  { id: 't111', text: 'Ordering water at a restaurant is a power move.', counter: 'Ordering only water is leaving joy on the table.' },
  { id: 't112', text: 'Top sheets are unnecessary.', counter: 'A bed without a top sheet is incomplete.' },
  { id: 't113', text: 'Hot dogs taste better at a ballpark than anywhere else.', counter: 'A hot dog tastes the same everywhere.' },
  { id: 't114', text: 'A minivan is the best family car.', counter: 'A minivan is where cool goes to retire.' },
  { id: 't115', text: 'Stairs count as exercise equipment.', counter: 'Stairs are just architecture.' },
  { id: 't116', text: 'A garage is a room of the house.', counter: 'A garage is a shed that got attached.' },
  { id: 't117', text: 'A blanket fort is legitimate architecture.', counter: 'A blanket fort is laundry with dreams.' },
  { id: 't118', text: 'The top bunk is the superior bunk.', counter: 'The bottom bunk is where the wise sleep.' },
  { id: 't119', text: 'A picnic is just eating on the floor outside.', counter: 'A picnic is dining at its finest.' },
  { id: 't120', text: 'Mini golf is better than real golf.', counter: 'Real golf is the real deal.' },

  // Animals and the outdoors
  { id: 't121', text: 'Squirrels are just rats with good PR.', counter: 'Squirrels are nothing like rats.' },
  { id: 't122', text: 'Penguins are the best-dressed animals.', counter: 'Plenty of animals out-dress the penguin.' },
  { id: 't123', text: 'Goldfish make great pets.', counter: 'Goldfish make terrible pets.' },
  { id: 't124', text: 'Geese are the villains of the park.', counter: 'Geese are misunderstood heroes.' },
  { id: 't125', text: 'Spiders in the house should be relocated, not squished.', counter: 'A spider in the house has forfeited its lease.' },
  { id: 't126', text: 'The beach is better than the mountains.', counter: 'The mountains are better than the beach.' },
  { id: 't127', text: 'Rain is the best weather for sleeping.', counter: 'Silence beats rain for sleeping.' },
  { id: 't128', text: 'Camping is a real vacation.', counter: 'Camping is chores in the woods.' },
  { id: 't129', text: 'Houseplants count as pets.', counter: 'A houseplant is furniture that drinks.' },
  { id: 't130', text: 'Snow days are the best days of the year.', counter: 'Snow days are just cold chores.' },

  // Modern life
  { id: 't131', text: 'Autocorrect causes more problems than it solves.', counter: 'Autocorrect saves us all daily.' },
  { id: 't132', text: 'Phone calls should be scheduled, never a surprise.', counter: 'A surprise call is a compliment.' },
  { id: 't133', text: 'Screenshots count as photography.', counter: 'Screenshots are hoarding, not photography.' },
  { id: 't134', text: 'Wired headphones are better than wireless.', counter: 'Wireless headphones ended the tangle dark ages.' },
  { id: 't135', text: 'Read receipts should be turned off forever.', counter: 'Read receipts keep everyone honest.' },
  { id: 't136', text: 'Rewatching a favorite show beats starting a new one.', counter: 'New shows beat reruns every time.' },
  { id: 't137', text: 'Movie trailers spoil too much.', counter: 'Trailers are the best part of going to the movies.' },
  { id: 't138', text: 'Password rules have gone too far.', counter: 'Strict passwords are saving you from yourself.' },
  { id: 't139', text: 'Selfies are a legitimate art form.', counter: 'A selfie is just pointing a camera at yourself.' },
  { id: 't140', text: 'Tablets are just big phones.', counter: 'A tablet is a computer in disguise.' },

  // Game night energy
  { id: 't141', text: 'Monopoly ruins friendships.', counter: 'Monopoly reveals who your friends really are.' },
  { id: 't142', text: 'The person who cooks should never do the dishes.', counter: 'The cook should clean their own battlefield.' },
  { id: 't143', text: 'Karaoke is only fun if you are bad at it.', counter: 'Karaoke rewards the talented.' },
  { id: 't144', text: 'The road trip is better than the destination.', counter: 'The destination is the whole point.' },
  { id: 't145', text: 'Puzzles are a group activity.', counter: 'Puzzles are sacred solo work.' },
  { id: 't146', text: 'The middle brownie is better than the corner brownie.', counter: 'The corner brownie is the champion of the pan.' },
  { id: 't147', text: 'Costumes should be homemade, not bought.', counter: 'A bought costume is a better costume.' },
  { id: 't148', text: 'Surprise parties are a kindness.', counter: 'A surprise party is an ambush with cake.' },
  { id: 't149', text: 'Shotgun is the best seat in the car.', counter: 'The back seat is the luxury seat.' },
  { id: 't150', text: 'It is acceptable to let kids win at games.', counter: 'Kids should earn every victory.' },
];

const FOOD_IDS = new Set([
  't01', 't02', 't03', 't06', 't12', 't14', 't15', 't16', 't20', 't22', 't25',
  't26', 't28', 't32', 't35', 't36', 't37', 't41', 't44', 't45', 't48', 't49',
  ...Array.from({ length: 30 }, (_, index) => `t${index + 51}`),
]);
const WORK_IDS = new Set(['t23', 't33', 't38', 't50', 't89', 't115', 't131', 't132', 't138']);
const FRIEND_IDS = new Set([
  't04', 't11', 't19', 't21', 't29', 't46', 't81', 't82', 't83', 't84', 't85',
  't86', 't87', 't88', 't90', 't91', 't93', 't94', 't95',
  ...Array.from({ length: 10 }, (_, index) => `t${index + 141}`),
]);
const BIG_ID_NUMBERS = new Set([5, 7, 10, 17, 18, 24, 27, 30, 47, 104, 105, 106, 126, 127, 128, 130, 134, 135, 136, 137, 139, 140]);
const FEATURED_IDS = new Set(['t01', 't03', 't09', 't19', 't29', 't33', 't38', 't50', 't81', 't88', 't126', 't148']);

function categoryFor(topic: BaseTopic): TopicCategory {
  const number = Number(topic.id.slice(1));
  if (FOOD_IDS.has(topic.id)) return 'Food fights';
  if (WORK_IDS.has(topic.id)) return 'Work-life dilemmas';
  if (FRIEND_IDS.has(topic.id)) return 'Friends and family';
  if (BIG_ID_NUMBERS.has(number)) return 'Big ideas';
  if (number >= 81 && number <= 100) return 'Everyday life';
  if (number >= 131 && number <= 140) return 'Everyday life';
  return 'Absurd arguments';
}

/**
 * The canonical public catalogue. Metadata is deterministic and versioned so
 * a round can freeze the exact prompt while clients search and filter locally.
 */
export const TOPICS: Topic[] = BASE_TOPICS.map((topic) => {
  const category = categoryFor(topic);
  const thoughtful = category === 'Big ideas' || category === 'Work-life dilemmas';
  return {
    ...topic,
    version: 1,
    title: topic.text.replace(/[.!?]$/, ''),
    category,
    tags: [category.toLowerCase().replace(/[^a-z]+/g, '-')],
    readingDifficulty: topic.text.length > 62 ? 'standard' : 'easy',
    tone: thoughtful ? 'thoughtful' : 'playful',
    audience: 'general',
    estimatedSeconds: thoughtful ? 90 : 60,
    allowedModes: thoughtful ? ['quickPlay', 'practice'] : ['quickPlay'],
    editorialStatus: 'published',
    visibility: 'public',
    featured: FEATURED_IDS.has(topic.id),
  };
});

export const TOPIC_CATEGORIES: TopicCategory[] = [
  'Food fights',
  'Everyday life',
  'Absurd arguments',
  'Friends and family',
  'Work-life dilemmas',
  'Big ideas',
];

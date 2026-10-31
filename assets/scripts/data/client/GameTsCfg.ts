export default {
  "Actor": {
    "1": {
      "id": 1,
      "name": "Crab",
      "prefab": "prefabs/CrabActor",
      "attackType": 1,
      "attack": 50,
      "defence": 10,
      "hp": 100,
      "speed": 2,
      "rage": 100
    },
    "2": {
      "id": 2,
      "name": "Prianha",
      "prefab": "prefabs/PiranhaActor",
      "attackType": 1,
      "attack": 30,
      "defence": 5,
      "hp": 120,
      "speed": 3,
      "rage": 100
    }
  },
  "Stage": {
    "1": {
      "id": 1,
      "fisheActor": "1,2"
    },
    "2": {
      "id": 2,
      "fisheActor": "2,2"
    }
  }
};
module.exports = function (member, points) {
  const roles = [
    { min: 0, max: 10, id: "1308931259279609907" },
    { min: 11, max: 20, id: "1308931309556465684" },
    { min: 21, max: 30, id: "1308931431573094450" },
    { min: 31, max: 40, id: "1308931496823881839" },
    { min: 41, max: 50, id: "1308931552255676436" },
    { min: 51, max: 60, id: "1308931608367071243" },
    { min: 61, max: 70, id: "1308931652013264896" },
    { min: 71, max: 90, id: "1308931679745867799" },
  ];

  const role = roles.find((role) => points >= role.min && points <= role.max);
  if (!role) return;

  const remove = roles.map(({ id }) => id);

  member.roles.remove(remove).then(() => member.roles.add(role.id));
};

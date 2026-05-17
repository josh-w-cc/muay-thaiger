import Skills from './Skills.jsx';


describe('training skills', () => {
  it('includes new no-equipment training options', () => {
    expect(Skills.breathwork.name).toBe('Breathwork');
    expect(Skills.clinch.name).toBe('Clinch Drills');
    expect(Skills.shadowbox.name).toBe('Shadow Boxing');
  });

  it('runs the new training actions against expected stats', () => {
    const fighter = {
      train: vi.fn(),
    };

    Skills.shadowbox.action(fighter);
    Skills.breathwork.action(fighter);
    Skills.clinch.action(fighter);

    expect(fighter.train).toHaveBeenNthCalledWith(1, 'agility', 3);
    expect(fighter.train).toHaveBeenNthCalledWith(2, 'skill', 2);
    expect(fighter.train).toHaveBeenNthCalledWith(3, 'stamina', 2);
    expect(fighter.train).toHaveBeenNthCalledWith(4, 'constitution', 2);
    expect(fighter.train).toHaveBeenNthCalledWith(5, 'skill', 3);
    expect(fighter.train).toHaveBeenNthCalledWith(6, 'stamina', 1);
    expect(fighter.train).toHaveBeenNthCalledWith(7, 'constitution', 6);
    expect(fighter.train).toHaveBeenNthCalledWith(8, 'skill', 2);
    expect(fighter.train).toHaveBeenNthCalledWith(9, 'strength', 6);
  });

  it('gates the new training options using fighter progression', () => {
    expect(Skills.shadowbox.requires({stamina: 51})).toBe(true);
    expect(Skills.shadowbox.requires({stamina: 50})).toBe(false);

    expect(Skills.breathwork.requires({stamina: 251, skill: 11})).toBe(true);
    expect(Skills.breathwork.requires({stamina: 250, skill: 11})).toBe(false);
    expect(Skills.breathwork.requires({stamina: 251, skill: 10})).toBe(false);

    expect(Skills.clinch.requires({constitution: 751, strength: 751})).toBe(true);
    expect(Skills.clinch.requires({constitution: 750, strength: 751})).toBe(false);
    expect(Skills.clinch.requires({constitution: 751, strength: 750})).toBe(false);
  });
});

import { useState, useEffect } from 'react';
import { fetchTeams } from '../api/teams';

export function useTeamCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchTeams().then((teams) => {
      if (!cancelled) {
        setCount(teams.length);
      }
    });

    // BUG (Medium): stale closure / missing cleanup — cancelled never set true on unmount
  }, []);

  return count;
}

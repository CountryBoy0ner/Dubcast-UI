import { firstValueFrom } from 'rxjs';
import { PlayerService } from './player.service';

describe('PlayerService', () => {
  beforeEach(() => localStorage.clear());

  it('should initialize volume from localStorage', async () => {
    localStorage.setItem('dubcast_volume', '55');

    const service = new PlayerService();

    const v = await firstValueFrom(service.volume$);
    expect(v).toBe(55);
  });

  it('setVolume should update state and persist', async () => {
    const service = new PlayerService();
    service.setVolume(80);

    expect(localStorage.getItem('dubcast_volume')).toBe('80');

    const v = await firstValueFrom(service.volume$);
    expect(v).toBe(80);
  });

  it('toggle should flip playing state', async () => {
    const service = new PlayerService();

    service.toggle();
    expect(await firstValueFrom(service.isPlaying$)).toBe(true);

    service.toggle();
    expect(await firstValueFrom(service.isPlaying$)).toBe(false);
  });
});

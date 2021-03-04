mp.events.add('C_Dev-CheckpointPos', () => {
    const position = {
        x: mp.players.local.position.x,
        y: mp.players.local.position.y,
        z: mp.game.gameplay.getGroundZFor3dCoord(mp.players.local.position.x,  mp.players.local.position.y,  mp.players.local.position.z, 1, false)
    }
    mp.events.callRemote('S_Dev-CheckpointPos', position)
})

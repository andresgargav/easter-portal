import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { Scene } from "../Scene";
import { NEW_EGG_TIME_DELAY, PORTAL_VOLUME } from "../Constants";
import { FriedEgg } from "./FriedEgg";
import { FRIED_EGGS_CONFIG } from "../Constants";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
}

export class BadEgg extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  private spriteName: string;
  private friedEggs: FriedEgg[] = [];

  scene: Scene;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    // Bad Egg Sprite
    this.spriteName = "bad_egg";
    this.sprite = scene.add.sprite(0, 0, this.spriteName);

    // Collisions
    this.setCollisions();

    // Animation
    this.createAnimations();

    // Action - Overlap
    this.overlapWithBasket();
    this.overlapWithSword();

    this.setDepth(1000000000);
    this.setSize(this.sprite.width, this.sprite.height);
    this.add(this.sprite);

    this.scene.physics.world.enable(this);
    (this.body as Phaser.Physics.Arcade.Body)
      .setAllowGravity(false)
      .setVelocityY(50);

    scene.add.existing(this);
  }

  private setCollisions() {
    this.scene.physics.add.collider(
      this,
      this.scene.ground as Phaser.GameObjects.GameObject,
      () => this.break(),
    );
  }

  private createAnimations() {
    this.scene.anims.create({
      key: `${this.spriteName}_disappear`,
      frames: this.scene.anims.generateFrameNumbers(
        `${this.spriteName}_disappear`,
        {
          start: 1,
          end: 14,
        },
      ),
      repeat: 0,
      frameRate: 15,
    });

    this.scene.anims.create({
      key: `${this.spriteName}_break`,
      frames: this.scene.anims.generateFrameNumbers(
        `${this.spriteName}_break`,
        {
          start: 1,
          end: 13,
        },
      ),
      repeat: 0,
      frameRate: 10,
    });
    //sound
    this.scene.time.delayedCall(NEW_EGG_TIME_DELAY, () => {
      this.scene.sound.play("new_egg", { volume: PORTAL_VOLUME });
    });
  }

  private overlapWithBasket() {
    this.scene.physics.add.overlap(
      this,
      this.player?.basket as Phaser.GameObjects.Zone,
      () => {
        if (
          (this.body as Phaser.Physics.Arcade.Body).bottom <=
          (this.player?.basket?.body as Phaser.Physics.Arcade.Body).top + 5
        ) {
          this.scene.sound.play("egg_break", { volume: PORTAL_VOLUME });
          this.createFriedEggGroup();
          this.destroy();
        }
      },
    );
  }

  private overlapWithSword() {
    this.scene.physics.add.overlap(
      this,
      this.player?.sword as Phaser.GameObjects.Zone,
      () => {
        (this.body as Phaser.Physics.Arcade.Body).enable = false;
        this.dissapear();
      },
    );
  }

  private dissapear() {
    this.scene.sound.play("egg_crack", { volume: PORTAL_VOLUME });
    this.sprite.anims.play(`${this.spriteName}_disappear`, true);
    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (anim: Phaser.Animations.Animation) => {
        if (anim.key === `${this.spriteName}_disappear`) {
          this.destroy();
        }
      },
    );
  }

  private break() {
    this.scene.sound.play("egg_break", { volume: PORTAL_VOLUME });
    this.createFriedEggGroup();

    this.sprite.anims.play(`${this.spriteName}_break`, true);
    this.sprite.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (anim: Phaser.Animations.Animation) => {
        if (anim.key === `${this.spriteName}_break`) {
          this.destroy();
        }
      },
    );
  }

  private createFriedEggGroup() {
    this.scene.sound.play("fried_egg", { volume: PORTAL_VOLUME });
    FRIED_EGGS_CONFIG.forEach((config) => {
      this.friedEggs.push(
        new FriedEgg({
          x: config.x,
          y: config.y,
          scene: this.scene,
        }),
      );
    });
  }

  destroyAllFriedEggs() {
    this.friedEggs.forEach((friedEgg) => {
      friedEgg.fadeDestroy();
    });
  }
}

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfileEntity } from './profile.entity';

export type ApiKeyStatus = 'active' | 'revoked';
export type ApiKeyRole = 'user' | 'admin';

@Entity({ name: 'api_keys' })
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 128 })
  label: string;

  @Column({ name: 'key_hash', type: 'text' })
  keyHash: string;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: ApiKeyStatus;

  @Column({ type: 'varchar', length: 16, default: 'user' })
  role: ApiKeyRole;

  @Column({ name: 'rate_limit_per_min', type: 'int', default: 100 })
  rateLimitPerMin: number;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;

  @OneToMany(() => ProfileEntity, (profile) => profile.sourceKey)
  profiles?: ProfileEntity[];
}



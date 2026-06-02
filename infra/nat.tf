###############################################################################
# NAT 인스턴스 (Managed NAT Gateway 대체 - 비용 방어 핵심)
#
# - t4g.micro (arm64), Public Subnet 배치, EIP 할당
# - source_dest_check = false (NAT 동작 필수 조건)
# - user_data 로 IP 포워딩 + iptables MASQUERADE 주입
# - Private-app 라우트 테이블의 0.0.0.0/0 을 이 인스턴스 ENI 로 바인딩
###############################################################################

locals {
  # 프라이빗 서브넷 대역 전체를 MASQUERADE 대상으로 사용
  nat_user_data = <<-EOF
    #!/bin/bash
    set -euxo pipefail

    # IP 포워딩 활성화 (영구 적용)
    echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/99-nat.conf
    sysctl -p /etc/sysctl.d/99-nat.conf

    # 기본 아웃바운드 인터페이스 탐지
    PRIMARY_IF=$(ip -o -4 route show to default | awk '{print $5}')

    # 프라이빗 서브넷에서 오는 트래픽을 외부로 MASQUERADE
    iptables -t nat -A POSTROUTING -o "$PRIMARY_IF" -s ${var.vpc_cidr} -j MASQUERADE
    iptables -F FORWARD

    # 규칙 영구 저장
    dnf install -y iptables-services
    iptables-save > /etc/sysconfig/iptables
    systemctl enable iptables
    systemctl start iptables
  EOF
}

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${local.prefix}-nat-eip"
  }
}

resource "aws_instance" "nat" {
  ami                         = data.aws_ssm_parameter.al2023_arm64.value
  instance_type               = var.nat_instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.nat.id]
  associate_public_ip_address = true

  # NAT 동작 필수: 자신을 목적지/출발지로 하지 않는 패킷 전달 허용
  source_dest_check = false

  user_data = local.nat_user_data

  metadata_options {
    http_tokens = "required" # IMDSv2 강제
  }

  tags = {
    Name = "${local.prefix}-nat-instance"
  }
}

resource "aws_eip_association" "nat" {
  instance_id   = aws_instance.nat.id
  allocation_id = aws_eip.nat.id
}

# Private-app 서브넷의 인터넷 경로를 NAT 인스턴스 ENI 로 바인딩
resource "aws_route" "private_app_nat" {
  route_table_id         = aws_route_table.private_app.id
  destination_cidr_block = "0.0.0.0/0"
  network_interface_id   = aws_instance.nat.primary_network_interface_id
}

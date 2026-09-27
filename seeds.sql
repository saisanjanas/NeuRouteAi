INSERT INTO users
(name, email, phone, role)
VALUES
(
    'Demo Driver',
    'demo.driver@example.com',
    '9000000000',
    'DRIVER'
);

INSERT INTO drivers
(user_id, license_number)
VALUES
(
    1,
    'NER-DEMO-001'
);

INSERT INTO vehicles
(
    vehicle_number,
    driver_id,
    vehicle_type,
    capacity_kg
)
VALUES
(
    'NER-DEMO-01',
    1,
    'Medical Supply Truck',
    5000
);